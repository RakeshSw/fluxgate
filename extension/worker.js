import {parseValue, editDocument, eligibleRequest, filteredHeaders, toBase64, fromBase64} from './engine.js';
const sessions = new Map();
const pending = new Set();
const target = tabId => ({tabId});
async function publish(tabId, state, message) {
  await chrome.storage.local.set({[`status_${tabId}`]:{state,message,at:new Date().toISOString()}});
}
async function stop(tabId, reason='Stopped') {
  const session=sessions.get(tabId);
  sessions.delete(tabId);
  if(session) {
    try { await chrome.debugger.sendCommand(target(tabId),'Fetch.disable'); } catch {}
    try { await chrome.debugger.detach(target(tabId)); } catch {}
  }
  await publish(tabId,'idle',reason);
}
async function start(tabId, rule) {
  if (!Number.isInteger(tabId)) throw new Error('No active tab');
  if (!rule?.urlFragment || !rule?.jsonPath) throw new Error('URL fragment and JSON path are required');
  if (sessions.has(tabId)) await stop(tabId,'Reconfigured');
  await chrome.debugger.attach(target(tabId),'1.3');
  try {
    await chrome.debugger.sendCommand(target(tabId),'Fetch.enable',{
      patterns:[{urlPattern:'*',requestStage:'Response'}]
    });
    sessions.set(tabId,{rule,hitCount:0});
    await publish(tabId,'active','Intercepting matching JSON GET responses; reload the demo.');
  } catch(err) {
    try {await chrome.debugger.detach(target(tabId));} catch {}
    throw err;
  }
}
async function intercept(tabId, params) {
  const id=params.requestId;
  const k=`${tabId}:${id}`;
  if(pending.has(k)) return;
  pending.add(k);
  const go=async()=>{try{await chrome.debugger.sendCommand(target(tabId),'Fetch.continueRequest',{requestId:id});}catch{}};
  try {
    const session=sessions.get(tabId);
    if(!session || !params.responseStatusCode) return await go();
    const mime=(params.responseHeaders||[]).find(x=>x.name.toLowerCase()==='content-type')?.value||'';
    if(!eligibleRequest(params.request.url,session.rule.urlFragment,mime,params.request.method)) return await go();
    const body=await chrome.debugger.sendCommand(target(tabId),'Fetch.getResponseBody',{requestId:id});
    const raw=body.base64Encoded?fromBase64(body.body):body.body;
    let data;
    try { data=JSON.parse(raw); } catch { return await go(); }
    const replacement=parseValue(session.rule.valueType,session.rule.value);
    let outcome;
    try {outcome=editDocument(data,session.rule.jsonPath,replacement);} catch {return await go();}
    const bytes=toBase64(JSON.stringify(outcome.document));
    await chrome.debugger.sendCommand(target(tabId),'Fetch.fulfillRequest',{
      requestId:id,responseCode:params.responseStatusCode,
      responseHeaders:filteredHeaders(params.responseHeaders),body:bytes
    });
    session.hitCount++;
    await publish(tabId,'hit',`Override #${session.hitCount}: ${session.rule.jsonPath} on ${params.request.url}`);
    if(session.rule.once) await stop(tabId,'One-shot rule completed.');
  } catch (err) {
    await publish(tabId,'error',`Interception error: ${String(err.message||err)}`);
    await go();
  } finally { pending.delete(k); }
}
chrome.debugger.onEvent.addListener((source,method,params)=>{
  if(method==='Fetch.requestPaused' && source.tabId != null) intercept(source.tabId,params);
});
chrome.debugger.onDetach.addListener((source,reason)=>{
  if(source.tabId!=null && sessions.has(source.tabId)) {
    sessions.delete(source.tabId);
    publish(source.tabId,'idle',`Debugger disconnected: ${reason}`);
  }
});
chrome.tabs.onRemoved.addListener(tabId=>{if(sessions.has(tabId))stop(tabId,'Tab closed');});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  (async()=>{
    const tabId=message.tabId;
    if(message.type==='start') await start(tabId,message.rule);
    else if(message.type==='stop') await stop(tabId);
    else if(message.type!=='status') throw new Error('Unknown command');
    return {ok:true,session:sessions.has(tabId),status:(await chrome.storage.local.get(`status_${tabId}`))[`status_${tabId}`]||null};
  })().then(reply).catch(err=>reply({ok:false,error:String(err.message||err)}));
  return true;
});

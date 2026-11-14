const $ = id => document.getElementById(id);
let tabId;
function show(text){$('status').textContent=text;}
async function current(){const tabs=await chrome.tabs.query({active:true,currentWindow:true});return tabs[0]?.id;}
function rule(){return {urlFragment:$('url').value.trim(),jsonPath:$('path').value.trim(),valueType:$('type').value,value:$('value').value,once:$('once').checked};}
function toggleValue(){ $('value').disabled=['blank','null'].includes($('type').value); }
$('type').addEventListener('change',toggleValue);
$('demo').addEventListener('click',()=>{ $('url').value='/api/products';$('path').value='products[0].name';$('type').value='blank';$('value').value='';$('once').checked=true;toggleValue();show('Demo rule loaded. Press Start, then reload the products.');});
$('start').addEventListener('click',async()=>{
 try{const settings=rule();if(!settings.urlFragment||!settings.jsonPath)throw new Error('Enter URL fragment and JSON path');await chrome.storage.local.set({lastRule:settings});const result=await chrome.runtime.sendMessage({type:'start',tabId,rule:settings});show(result.ok?'Intercept armed. Reload the test page.':result.error);}catch(e){show(e.message);}
});
$('stop').addEventListener('click',async()=>{const result=await chrome.runtime.sendMessage({type:'stop',tabId});show(result.ok?'Stopped':result.error);});
(async()=>{tabId=await current();const data=await chrome.storage.local.get('lastRule');if(data.lastRule){const v=data.lastRule;$('url').value=v.urlFragment||'';$('path').value=v.jsonPath||'';$('type').value=v.valueType||'blank';$('value').value=v.value||'';$('once').checked=v.once!==false;}toggleValue();if(!tabId)show('Open a regular web page first.');else{const r=await chrome.runtime.sendMessage({type:'status',tabId});if(r.status)show(r.status.message);}})();

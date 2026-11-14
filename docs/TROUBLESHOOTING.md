# Troubleshooting

## Forwarded port opens a file listing

The noVNC server is reachable, but you are at `/`. Click **vnc.html** or open your forwarded port's URL with `/vnc.html?autoconnect=true&resize=scale` appended.

## A password is requested

Expected. In the Codespaces terminal run `docker compose logs fluxgate | grep -i password`. Use the password only in your private session. **Do not paste it into issues, screenshots or chat.**

## Browser doesn't open / blank desktop

Run:

```bash
docker compose ps
docker compose logs --tail=100 fluxgate
docker compose logs --tail=80 demo
```

Confirm both containers are running and `demo` is healthy. If needed, `docker compose restart fluxgate` and reopen noVNC.

## Extension not visible

Use the **puzzle-piece icon in the remote Chrome session inside noVNC**. The extension is not automatically installed in your laptop's Chrome. If Chrome starts without it, inspect `docker compose logs fluxgate` and the Chrome launch settings in `start.sh`.

## Interception doesn't change the page

Check that you clicked **Start** on the correct tab, the URL fragment is `/api/products`, the path is `products[0].name`, and the replacement type/value are valid. Then click **Reload products** (the existing first render is not retroactively changed). One-shot mode stops after a successful override; press **Start** again to re-arm. If another debugger/devtools session controls the tab, close it and retry.

## Restore original data

Click **Stop**, then **Reload products**. For one-shot rules, a subsequent reload after successful completion should return original data.

## Port 6080 isn't visible in Codespaces

Open the **Ports** panel and forward TCP port `6080` manually. Keep **Visibility: Private**. Don't share the forwarded URL publicly.

## Shut down and clean up

```bash
docker compose down
# Optional: permanently remove disposable browser profile
# docker compose down -v
```

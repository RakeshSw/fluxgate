# FluxGate security boundaries

Use FluxGate exclusively for authorized test traffic. The extension receives browser debugger permission, which gives broad capability over the attached tab. It supports only GET JSON response body overrides, but can influence later UI behavior. The Docker lab is deliberately isolated and not appropriate for general browsing or sensitive credentials.

Keep noVNC loopback-bound locally and Codespaces forwarded port private. A generated VNC password adds a defense layer but VNC authentication uses only 8 characters and is not a replacement for network isolation. In Docker, the browser runs with `--no-sandbox` by default for test compatibility; do not access hostile content. Chrome debugger can conflict with open DevTools.

Do not add tokens, personal files, cookies, company data or internal endpoints to the source repository. Report security issues privately to the repository owner rather than opening a public issue with exploit details.

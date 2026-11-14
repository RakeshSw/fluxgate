# FluxGate — browser JSON fault-injection lab

FluxGate is an isolated browser testing lab. Its Manifest V3 Chrome extension uses the Chrome DevTools Protocol to intercept a **GET JSON response** from a chosen test website and replace one existing JSON property. The package includes its own synthetic sample application and a remote browser accessible through noVNC.

> **Security:** This is a lab, not a public hosted service. Test only sites you are authorized to test. Never expose the browser/noVNC endpoint on the public internet or use this browser for private accounts. The container browser runs with Chrome's sandbox disabled by default for container compatibility. Do not publish this image as a general-purpose browsing service.

## Run locally using Docker

1. Install Docker and Compose V2.
2. Execute `docker compose up --build -d` in the repository root.
3. Execute `docker compose logs fluxgate` to read the **8-character VNC password** generated for this session.
4. Open `http://localhost:6080/vnc.html?autoconnect=true&resize=scale` and enter that password.
5. In the container Chrome window, open the **FluxGate** extension toolbar icon. Press **Load demo rule**, then **Start**. Return to the demo store and select **Reload products**.
6. Expected result: the first product's `name` changes from `Sample Notebook` to the empty string **only in the browser**. The synthetic API itself remains unchanged.

To stop: `docker compose down`. To delete the saved disposable browser profile: `docker compose down -v`.

## Run from GitHub Codespaces

1. Create a Codespace from the repository's **Code → Codespaces** menu. The devcontainer config requests Docker tooling and forwards port 6080 as **Private**.
2. In the Codespaces terminal run `docker compose up --build -d`.
3. Run `docker compose logs fluxgate` to obtain the VNC password.
4. Use Codespaces **Ports** → 6080 → **Open in Browser**. Append `/vnc.html?autoconnect=true&resize=scale` to the forwarded URL if needed.
5. Follow the demo steps above. **Keep Codespaces port 6080 private**; noVNC should never be exposed on a public port.

**Codespaces integration has not yet been live-tested.** The configuration and static tests are provided for first-run validation.

## Browser extension only

For Chrome for Testing (or a browser that supports loading unpacked MV3 extensions), open `chrome://extensions`, enable Developer Mode, choose Load unpacked, and select the `extension` directory. No browser extension store submission or automatic host installation is included.

## Supported / not supported

- **Supported:** one active-tab rule, URL-substring matching, existing JSON field path such as `products[0].name`, blank/null/string/number/boolean/JSON replacements, one-shot or continuous intercept, simple local rule persistence.
- **Not supported:** status code overrides, changing requests, write interception, binary/compressed body rewriting, streaming responses, complex match rules, automatic extension testing across arbitrary sites.
- This is not a network proxy or an API security scanner.

## Tests

```bash
node --test extension/tests/*.test.mjs
python -m unittest discover -s tests -v
docker compose config --quiet
docker compose up --build -d
```

JavaScript/Python checks can run without Docker. A complete live Chrome + noVNC + CDP validation requires a machine with Docker.

## Code provenance and rights

This repository is a **new company-neutral implementation based on generic functional requirements**, using a functional specification. It does not bundle the original enterprise ZIP or its icons, certificates, connection details, test data, names or internal configuration. **Before publishing, the repository owner must still confirm their employment/IP obligations permit public release of a functionally similar tool.** Company-reference removal and independent implementation do not override contractual obligations.

No secrets or credentials are included. Generated user/browser profile data stays in a Docker named volume, not inside the repository.

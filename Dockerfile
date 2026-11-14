FROM debian:bookworm-slim
ARG CFT_VERSION=151.0.7922.77
ARG DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99 LANG=C.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl unzip tini gosu xvfb fluxbox x11vnc novnc websockify dbus-x11 fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 libxshmfence1 && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL --retry 3 "https://storage.googleapis.com/chrome-for-testing-public/${CFT_VERSION}/linux64/chrome-linux64.zip" -o /tmp/browser.zip && mkdir -p /opt/browser && unzip -q /tmp/browser.zip -d /opt/browser && rm /tmp/browser.zip
RUN useradd -m -u 1000 -s /bin/bash labuser && mkdir -p /opt/fluxgate /home/labuser/profile && chown -R labuser:labuser /home/labuser
COPY extension/ /opt/fluxgate/extension/
COPY start.sh /opt/fluxgate/start.sh
RUN chmod +x /opt/fluxgate/start.sh && chown -R labuser:labuser /opt/fluxgate/extension
EXPOSE 6080
HEALTHCHECK --interval=15s --timeout=4s --start-period=45s CMD curl -fsS http://127.0.0.1:6080/vnc.html >/dev/null || exit 1
ENTRYPOINT ["/usr/bin/tini","--","/opt/fluxgate/start.sh"]

FROM python:3.13-slim
WORKDIR /app
COPY server.py index.html ./
USER 65534:65534
EXPOSE 8080
CMD ["python","server.py"]

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path

PAGE = (Path(__file__).parent / 'index.html').read_bytes()
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] in ('/', '/index.html'):
            body, mime = PAGE, 'text/html; charset=utf-8'
        elif self.path.startswith('/api/products'):
            body = json.dumps({'products':[{'id':'P-101','name':'Sample Notebook','inStock':True,'price':12.5}], 'status':'ok'}).encode()
            mime = 'application/json; charset=utf-8'
        elif self.path == '/health':
            body, mime = b'ok', 'text/plain'
        else:
            self.send_error(404); return
        self.send_response(200)
        self.send_header('Content-Type',mime)
        self.send_header('Cache-Control','no-store')
        self.send_header('Content-Length',str(len(body)))
        self.end_headers()
        self.wfile.write(body)
if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0',8080), Handler).serve_forever()

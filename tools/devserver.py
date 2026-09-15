"""Servidor local de desenvolvimento.
Serve a pasta do projeto e aceita POST /save?name=arquivo.png com o corpo em base64,
gravando em src/icons/ (usado para gerar os icones do app a partir da arte do jogo).
"""
import base64, http.server, os, pathlib, re, sys, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = ROOT / "src" / "icons"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        name = (q.get("name") or [""])[0]
        if u.path != "/save" or not re.fullmatch(r"[a-z0-9\-]+\.png", name):
            self.send_response(400); self.end_headers(); return
        n = int(self.headers.get("Content-Length") or 0)
        data = base64.b64decode(self.rfile.read(n))
        ICONS.mkdir(parents=True, exist_ok=True)
        (ICONS / name).write_bytes(data)
        self.send_response(200); self.end_headers()
        self.wfile.write(f"saved {name} {len(data)} bytes".encode())

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()

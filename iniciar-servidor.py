#!/usr/bin/env python3
"""Servidor local opcional para o jogo. Requer Python 3."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    with ThreadingHTTPServer(('127.0.0.1', 8765), partial(SimpleHTTPRequestHandler, directory=str(root))) as server:
        url = f'http://127.0.0.1:{server.server_port}/index.html'
        print(f'Jogo: {url}\nMantenha esta janela aberta. Ctrl+C para encerrar.')
        webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass

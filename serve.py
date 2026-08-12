#!/usr/bin/env python3
"""CORS-enabled static file server for the Takoyaki Todo widget."""
import http.server
import os

PORT = 8123


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    http.server.ThreadingHTTPServer(("", PORT), CORSRequestHandler).serve_forever()

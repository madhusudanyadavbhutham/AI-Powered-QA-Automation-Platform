from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class LoginHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/login":
            self.path = "/index.html"

        super().do_GET()

    def guess_type(self, path):
        if path == "/index.html":
            return "text/html"
        return super().guess_type(path)


server = ThreadingHTTPServer(
    ("127.0.0.1", 3000),
    LoginHandler,
)

print("Demo login application running at:")
print("http://127.0.0.1:3000/login")

server.serve_forever()
import http.server
import socketserver
import json
import subprocess
import os

PORT = 8000

class SimulationHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/run':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data)

            # Build the input string for the C++ program
            # Format: json <algorithm_id>-<quantum> <last_instant> <process_count>
            # Followed by <name>,<arrival>,<service> for each process
            
            algo_id = params.get('algorithm', '1')
            quantum = params.get('quantum', '1')
            last_instant = params.get('lastInstant', '20')
            processes = params.get('processes', [])
            
            input_str = f"json {algo_id}-{quantum} {last_instant} {len(processes)}\n"
            for p in processes:
                input_str += f"{p['name']},{p['arrival']},{p['service']}\n"

            try:
                # Run the C++ binary
                # Check for lab4.exe on Windows, or lab4 on Linux/macOS
                binary = "./lab4.exe" if os.path.exists("./lab4.exe") else "./lab4"
                
                process = subprocess.Popen(
                    [binary],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                stdout, stderr = process.communicate(input=input_str)
                
                if process.returncode != 0:
                    print(f"Error: {stderr}")
                    self.send_error(500, f"C++ program failed: {stderr}")
                    return

                # The C++ program outputs several algorithms if provided.
                # Since the web UI currently sends one at a time, we take the whole output.
                json_output = stdout.strip()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json_output.encode())

            except Exception as e:
                print(f"Exception: {e}")
                self.send_error(500, str(e))
        else:
            super().do_POST()

    def do_GET(self):
        # Serve files from the 'web' directory
        if self.path == '/' or self.path == '/index.html':
            self.path = '/web/index.html'
        elif self.path.startswith('/style.css') or self.path.startswith('/script.js'):
            self.path = '/web' + self.path
        
        return super().do_GET()

print(f"Server starting at http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), SimulationHandler) as httpd:
    httpd.serve_forever()

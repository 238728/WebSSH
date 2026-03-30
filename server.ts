import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Client } from "ssh2";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Configuration endpoints removed — clients persist config in localStorage.

  io.on("connection", (socket) => {
    let sshClient: Client | null = null;

    socket.on("ssh-connect", (config) => {
      sshClient = new Client();
      
      sshClient
        .on("ready", () => {
          socket.emit("ssh-ready");
          
          // Shell support
          sshClient?.shell((err, stream) => {
            if (err) {
              socket.emit("ssh-error", err.message);
              return;
            }
            
            socket.on("ssh-input", (data) => {
              stream.write(data);
            });

            socket.on("ssh-resize", (cols, rows) => {
              stream.setWindow(rows, cols, 0, 0);
            });

            stream.on("data", (data: Buffer) => {
              socket.emit("ssh-output", data.toString("utf-8"));
            });

            stream.on("close", () => {
              sshClient?.end();
              socket.emit("ssh-closed");
            });
          });

          // SFTP support
          sshClient?.sftp((err, sftp) => {
            if (err) {
              socket.emit("sftp-error", err.message);
              return;
            }

            socket.on("sftp-list", (dirPath) => {
              sftp.readdir(dirPath || ".", (err, list) => {
                if (err) {
                  socket.emit("sftp-error", { message: err.message, path: dirPath });
                  return;
                }
                socket.emit("sftp-list-result", { path: dirPath, files: list });
              });
            });

            socket.on("sftp-download", (filePath) => {
              sftp.readFile(filePath, (err, data) => {
                if (err) {
                  socket.emit("sftp-error", { message: err.message, path: filePath });
                  return;
                }
                socket.emit("sftp-download-result", { 
                  path: filePath, 
                  data: data.toString("base64"),
                  filename: path.basename(filePath)
                });
              });
            });

            socket.on("sftp-upload", ({ filePath, data, filename }) => {
              const buffer = Buffer.from(data, "base64");
              const fullPath = path.join(filePath, filename);
              sftp.writeFile(fullPath, buffer, (err) => {
                if (err) {
                  socket.emit("sftp-error", { message: err.message, path: fullPath });
                  return;
                }
                socket.emit("sftp-upload-result", { path: fullPath, success: true });
                // Refresh list after upload
                sftp.readdir(filePath, (err, list) => {
                  if (!err) socket.emit("sftp-list-result", { path: filePath, files: list });
                });
              });
            });

            socket.on("sftp-mkdir", (dirPath) => {
              sftp.mkdir(dirPath, (err) => {
                if (err) {
                  socket.emit("sftp-error", { message: err.message, path: dirPath });
                  return;
                }
                socket.emit("sftp-mkdir-result", { path: dirPath, success: true });
              });
            });

            socket.on("sftp-rm", (filePath) => {
              sftp.unlink(filePath, (err) => {
                if (err) {
                  // Try rmdir if unlink fails
                  sftp.rmdir(filePath, (err2) => {
                    if (err2) {
                      socket.emit("sftp-error", { message: err2.message, path: filePath });
                    } else {
                      socket.emit("sftp-rm-result", { path: filePath, success: true });
                    }
                  });
                } else {
                  socket.emit("sftp-rm-result", { path: filePath, success: true });
                }
              });
            });
          });
        })
        .on("error", (err) => {
          socket.emit("ssh-error", err.message);
        })
        .connect({
          host: config.host,
          port: config.port || 22,
          username: config.username,
          password: config.password,
          privateKey: config.privateKey,
          passphrase: config.passphrase,
        });
    });

    socket.on("disconnect", () => {
      if (sshClient) {
        sshClient.end();
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

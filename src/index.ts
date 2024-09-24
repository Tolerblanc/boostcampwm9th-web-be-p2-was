import net from "node:net";
import { logger } from "./util/logger";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type TUser = {
  userId: string;
  name: string;
  email: string;
  password: string;
};

function getDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}

const __dirname = getDirname(import.meta.url);

const EXT_NAME = {
  html: "html",
  txt: "txt",
  css: "css",
  ico: "ico",
  png: "png",
  jpg: "jpg",
  js: "js",
} as const;

const CONTENT_TYPE = {
  [EXT_NAME.html]: "text/html",
  [EXT_NAME.txt]: "text/plain",
  [EXT_NAME.css]: "text/css",
  [EXT_NAME.ico]: "image/x-icon",
  [EXT_NAME.png]: "image/png",
  [EXT_NAME.jpg]: "image/jpeg",
  [EXT_NAME.js]: "text/javascript",
  json: "application/json",
} as const;

function serveStaticFile(socket: net.Socket, uri: string) {
  const ext = extname(uri).slice(1);

  const dir = EXT_NAME[ext] === EXT_NAME.html ? "views" : "static";

  const rootDir = join(__dirname, "../");
  const filePath = join(rootDir, `/${dir}`, uri);

  if (!existsSync(filePath)) {
    const error = new Error("Not Found");
    error.status = 404;
    throw error;
  }

  const data = readFileSync(filePath);

  socket.write("HTTP/1.1 200 OK\r\n");
  socket.write(`Content-Type: ${CONTENT_TYPE[ext]}\r\n`);
  socket.write("\r\n");
  socket.write(data);
}

function parseQueryParameters(str: string) {
  const queries = str.split("&").map((data) => data.split("="));

  return queries.reduce<Record<string, string>>((acc, cur) => {
    const [key, value] = cur;

    acc[key] = value;

    return acc;
  }, {});
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const [requestHeader, body] = data.toString().split("\r\n\r\n");
    const [firstLine, ...options] = requestHeader.split("\r\n");
    const [method, uri, protocol] = firstLine.split(" ");

    const [endpoint, queryString] = uri.split("?");

    logger.info(`${protocol} ${method} ${uri}`);

    if (method === "GET") {
      try {
        const ext = extname(endpoint).slice(1);

        if (ext) {
          if (!EXT_NAME[ext]) {
            // TODO: Custom Error로 변경
            const error = new Error("Unsupported Media Type");
            error.status = 415;
            throw error;
          }

          // *미들웨어: 정적 파일 서빙
          serveStaticFile(socket, uri);
        } else {
          if (endpoint === "/create") {
            const query = parseQueryParameters(queryString);

            const { userId, password, name, email } = query;

            const rootDir = join(__dirname, "../");
            const dbPath = join(rootDir, "db", "user.json");

            const users = JSON.parse(
              readFileSync(dbPath).toString()
            ) as TUser[];

            const existUser = users.find((user) => {
              return (
                user.name === name ||
                user.userId === userId ||
                user.email === email
              );
            });

            if (existUser) {
              const error = new Error("Aleady Exist");
              error.status = 409;
              throw error;
            }

            const newUser = { userId, password, email, name };

            users.push(newUser);

            writeFileSync(dbPath, JSON.stringify(users));

            socket.write("HTTP/1.1 200 OK\r\n");
            socket.write(`Content-Type: ${CONTENT_TYPE.json}\r\n`);
            socket.write("\r\n");
            socket.write(JSON.stringify(newUser));
          }
        }
      } catch (e) {
        socket.write(`HTTP/1.1 ${e.status} ${e.message}`);
        socket.write("Content-Type: text/plain\r\n");
        socket.write("\r\n");
        socket.write(`${e.message}\r\n`);
        logger.error(`${method} ${uri} ${e.stack}`);
      } finally {
        socket.end();
      }
    }
  });
});

server.listen(3000, () => {
  logger.info("3000번 포트에서 서버 대기 중");
});

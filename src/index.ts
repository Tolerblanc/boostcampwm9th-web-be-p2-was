import net from "node:net";
import { CustomError } from "@/src/util/customError";
import { getDirname } from "@/src/util/getDirname";
import { logger } from "./util/logger";
import { extname, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type TUser = {
  userId: string;
  name: string;
  email: string;
  password: string;
};

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
    throw new CustomError({ status: 404, message: "Not Found" });
  }

  const data = readFileSync(filePath);

  sendResponse(socket, {
    status: 200,
    message: "OK",
    contentType: CONTENT_TYPE[ext],
    data: data.toString(),
  });
}

function parseQueryParameters(str: string) {
  const queries = str.split("&").map((data) => data.split("="));

  return queries.reduce<Record<string, string>>((acc, cur) => {
    const [key, value] = cur;

    acc[key] = value;

    return acc;
  }, {});
}

function parseRequestData(data: string) {
  const [requestHeader] = data.toString().split("\r\n\r\n");
  const [firstLine] = requestHeader.split("\r\n");
  const [method, uri, protocol] = firstLine.split(" ");

  const [endpoint, queryString] = uri.split("?");

  return { protocol, method, uri, endpoint, queryString };
}

function sendResponse(
  socket: net.Socket,
  options: Record<string, string | number>
) {
  const { status, message, contentType, data } = options;
  socket.write(`HTTP/1.1 ${status} ${message}\r\n`);
  socket.write(`Content-Type: ${contentType}\r\n`);
  socket.write("\r\n");

  if (data) socket.write(data as string);
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const { protocol, method, uri, endpoint, queryString } = parseRequestData(
      data.toString()
    );

    logger.info(`${protocol} ${method} ${uri}`);

    try {
      if (method === "GET") {
        const ext = extname(endpoint).slice(1);

        if (ext) {
          if (!EXT_NAME[ext]) {
            throw new CustomError({
              status: 415,
              message: "Unsupported Media Type",
            });
          }

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
              throw new CustomError({ status: 409, message: "Aleady Exist" });
            }

            const newUser = { userId, password, email, name };

            users.push(newUser);

            writeFileSync(dbPath, JSON.stringify(users));

            sendResponse(socket, {
              status: 200,
              message: "OK",
              contentType: CONTENT_TYPE.json,
              data: JSON.stringify(newUser),
            });
          } else {
            throw new CustomError({ status: 404, message: "Not Found" });
          }
        }
      } else {
        throw new CustomError({ status: 405, message: "Method Not Allowed" });
      }
    } catch (e) {
      const {
        status = 500,
        message = "Internal Server Error",
        stack,
      } = e as CustomError;

      sendResponse(socket, {
        status,
        message,
        data: message,
        contentType: CONTENT_TYPE[EXT_NAME.txt],
      });

      logger.error(`${method} ${uri}\n${stack}`);
    } finally {
      socket.end();
    }
  });
});

server.listen(3000, () => {
  logger.info("3000번 포트에서 서버 대기 중");
});

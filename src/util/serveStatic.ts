import net from "net";
import { join, extname } from "node:path";
import { readFileSync, existsSync } from "node:fs";

import { getDirname } from "./getDirname";
import { CustomError } from "@/util/customError";
import { sendResponse } from "@/util/sendResponse";
import { CONTENT_TYPE, EXT_NAME } from "@/constants/contentType.enum";

const __dirname = getDirname(import.meta.url);

function serveStaticFile(socket: net.Socket, uri: string) {
  const ext = extname(uri).slice(1) as keyof typeof EXT_NAME;

  const dir = EXT_NAME[ext] === EXT_NAME.html ? "views" : "static";

  const rootDir = join(__dirname, "../../");
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

export { serveStaticFile };

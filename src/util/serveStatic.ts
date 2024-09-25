import net from "net";
import { join, extname } from "node:path";
import { readFile, access, constants } from "node:fs/promises";

import { getDirname } from "./getDirname";
import { NotFoundError } from "@/util/httpError";
import { sendResponse } from "@/util/sendResponse";
import { CONTENT_TYPE, EXT_NAME } from "@/constants/contentType.enum";

const __dirname = getDirname(import.meta.url);

async function serveStaticFile(socket: net.Socket, uri: string) {
  const ext = extname(uri).slice(1) as keyof typeof EXT_NAME;

  const dir = EXT_NAME[ext] === EXT_NAME.html ? "views" : "static";

  const rootDir = join(__dirname, "../");
  const filePath = join(rootDir, `/${dir}`, uri);

  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new NotFoundError("Not Found");
  }

  const data = await readFile(filePath);

  sendResponse(socket, {
    status: 200,
    message: "OK",
    contentType: CONTENT_TYPE[ext],
    data: data.toString(),
  });
}

export { serveStaticFile };

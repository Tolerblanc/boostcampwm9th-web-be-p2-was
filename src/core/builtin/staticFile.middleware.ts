import { join, extname } from "node:path";
import { readFile, access, constants } from "node:fs/promises";

import { getDirname } from "@/core/util/getDirname";
import {
  NotFoundError,
  UnsupportedMediaTypeError,
} from "@/core/http/httpError";
import { CONTENT_TYPE, EXT_NAME, ExtName } from "@/core/http/contentType.enum";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";

const __dirname = getDirname(import.meta.url);

async function handleStaticFileRoute(request: Request, response: Response) {
  const ext = extname(request.path).slice(1).toLowerCase() as ExtName;
  if (ext) {
    if (!EXT_NAME.includes(ext)) {
      throw new UnsupportedMediaTypeError();
    }

    await serveStaticFile(request, response);
  }
}

async function serveStaticFile(req: Request, res: Response) {
  const ext = extname(req.path).slice(1).toLowerCase() as ExtName;

  const dir = ext === "html" ? "views" : "static";

  const rootDir = join(__dirname, "../../../");
  const filePath = join(rootDir, `/${dir}`, req.path);

  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new NotFoundError("Not Found");
  }

  const data = await readFile(filePath);

  res.contentType(CONTENT_TYPE[ext]).data(data.toString()).send();
}

export { handleStaticFileRoute };

import { join, extname } from "node:path";
import { readFile, access, constants } from "node:fs/promises";

import { getDirname } from "./getDirname";
import { NotFoundError } from "@/util/httpError";
import { CONTENT_TYPE, ExtName } from "@/constants/contentType.enum";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

const __dirname = getDirname(import.meta.url);

async function serveStaticFile(req: Request, res: Response) {
  const ext = extname(req.uri).slice(1).toLowerCase() as ExtName;

  const dir = ext === "html" ? "views" : "static";

  const rootDir = join(__dirname, "../../");
  const filePath = join(rootDir, `/${dir}`, req.uri);

  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new NotFoundError("Not Found");
  }

  const data = await readFile(filePath);

  res.contentType = CONTENT_TYPE[ext];
  res.data = data.toString();
  res.send();
}

export { serveStaticFile };

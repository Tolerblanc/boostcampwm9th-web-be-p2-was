import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

function getDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}

export { getDirname };

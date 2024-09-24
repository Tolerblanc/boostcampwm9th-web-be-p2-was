import { dirname } from "path";
import { fileURLToPath } from "url";

function getDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}

export { getDirname };

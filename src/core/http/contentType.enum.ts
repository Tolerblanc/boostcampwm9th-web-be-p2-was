const EXT_NAME = ["html", "txt", "css", "ico", "png", "jpg", "js"] as const;

type ExtName = (typeof EXT_NAME)[number];

const CONTENT_TYPE: Record<ExtName, string> = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  ico: "image/x-icon",
  png: "image/png",
  jpg: "image/jpeg",
  js: "text/javascript",
};

export { EXT_NAME, ExtName, CONTENT_TYPE };

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

export { EXT_NAME, CONTENT_TYPE };

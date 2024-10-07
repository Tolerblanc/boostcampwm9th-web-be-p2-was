import { CONTENT_TYPE } from "@/core/http/contentType.enum";
import net from "node:net";

type CookieOptions = {
  expires?: Date;
  maxAge?: number;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

const cookieOptionsToHeader = (options: CookieOptions) => {
  const parts: string[] = [];

  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  return parts.length ? `; ${parts.join("; ")}` : "";
};

class Response {
  private _status: number;
  private _message: string;
  private _contentType: string;
  private _additionalHeaders: Record<string, string>;
  private _data: string;

  // 요청이 완료되었는가
  // TODO: 미들웨어 체인을 개선하여 없애보기
  private _isSent: boolean;

  constructor(private _socket: net.Socket) {
    this._status = 200;
    this._message = "OK";
    this._contentType = CONTENT_TYPE.txt;
    this._data = "";
    this._additionalHeaders = {};
    this._isSent = false;
  }

  ok() {
    this._status = 200;
    this._message = "OK";
    return this;
  }

  created() {
    this._status = 201;
    this._message = "Created";
    return this;
  }

  redirect(url: string) {
    this._status = 302;
    this._message = "Found";
    this._additionalHeaders["Location"] = url;
    return this;
  }

  status(status: number) {
    this._status = status;
    return this;
  }

  message(message: string) {
    this._message = message;
    return this;
  }

  contentType(contentType: string) {
    this._contentType = contentType;
    return this;
  }

  data(data: object | string) {
    this._data = typeof data === "object" ? JSON.stringify(data) : data;
    return this;
  }

  send() {
    const headers = [
      `HTTP/1.1 ${this._status} ${this._message}`,
      `Content-Type: ${this._contentType}`,
      ...Object.entries(this._additionalHeaders).map(
        ([key, value]) => `${key}: ${value}`
      ),
    ];

    this._socket.write(headers.join("\r\n") + "\r\n\r\n");
    if (this._data) this._socket.write(this._data);
    this._isSent = true;
  }

  cookie(key: string, value: string, options: CookieOptions = {}) {
    const cookieHeader = `${key}=${value}${cookieOptionsToHeader(options)}`;
    this._additionalHeaders["Set-Cookie"] = cookieHeader;
    return this;
  }

  get isSent() {
    return this._isSent;
  }
}

export { Response };

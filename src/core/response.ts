import { CONTENT_TYPE } from "@/constants/contentType.enum";
import net from "node:net";

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

  data(data: string) {
    this._data = data;
    return this;
  }

  send() {
    this._socket.write(`HTTP/1.1 ${this._status} ${this._message}\r\n`);
    this._socket.write(`Content-Type: ${this._contentType}\r\n`);
    Object.entries(this._additionalHeaders).forEach(([key, value]) => {
      this._socket.write(`${key}: ${value}\r\n`);
    });
    this._socket.write("\r\n");
    if (this._data) this._socket.write(this._data);
    this._isSent = true;
  }

  get isSent() {
    return this._isSent;
  }
}

export { Response };

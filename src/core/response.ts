import { CONTENT_TYPE } from "@/constants/contentType.enum";
import net from "node:net";

class Response {
  //TODO: 빌더 패턴으로 변경하기
  private socket: net.Socket;
  accessor status: number;
  accessor message: string;
  accessor contentType: string;
  accessor data: string | null;

  constructor(socket: net.Socket) {
    this.socket = socket;
    this.status = 200;
    this.message = "OK";
    this.contentType = CONTENT_TYPE.txt;
    this.data = null;
  }

  send() {
    this.socket.write(`HTTP/1.1 ${this.status} ${this.message}\r\n`);
    this.socket.write(`Content-Type: ${this.contentType}\r\n`);
    this.socket.write("\r\n");
    if (this.data) this.socket.write(this.data);
  }
}

export { Response };

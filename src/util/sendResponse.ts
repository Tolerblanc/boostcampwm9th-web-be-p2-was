import net from "node:net";

type ResponseOptions = {
  status: number;
  message: string;
  contentType: string;
  data?: string;
};

function sendResponse(socket: net.Socket, options: ResponseOptions) {
  const { status, message, contentType, data } = options;
  socket.write(`HTTP/1.1 ${status} ${message}\r\n`);
  socket.write(`Content-Type: ${contentType}\r\n`);
  socket.write("\r\n");

  if (data) socket.write(data as string);
}

export { sendResponse };

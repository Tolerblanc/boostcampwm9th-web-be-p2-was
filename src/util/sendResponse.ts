import net from "node:net";

function sendResponse(
  socket: net.Socket,
  options: Record<string, string | number>
) {
  const { status, message, contentType, data } = options;
  socket.write(`HTTP/1.1 ${status} ${message}\r\n`);
  socket.write(`Content-Type: ${contentType}\r\n`);
  socket.write("\r\n");

  if (data) socket.write(data as string);
}

export { sendResponse };

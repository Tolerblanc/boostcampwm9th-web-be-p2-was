class ConnectionBuffer {
  private data: Buffer;
  private size: number;
  private readonly maxSize: number;

  constructor(maxSize: number = 1024 * 1024 * 10) {
    this.data = Buffer.alloc(0);
    this.size = 0;
    this.maxSize = maxSize;
  }

  addChunk(chunk: Buffer): boolean {
    if (this.size + chunk.length > this.maxSize) {
      return false;
    }
    this.data = Buffer.concat([this.data, chunk]);
    this.size += chunk.length;
    return true;
  }

  clear() {
    this.data = Buffer.alloc(0);
    this.size = 0;
  }

  isCompleteHttpRequest(): boolean {
    const str = this.data.toString();
    const headerEnd = str.indexOf("\r\n\r\n");

    if (headerEnd === -1) return false;

    const contentLengthMatch = str.match(/Content-Length: (\d+)/i);
    if (contentLengthMatch) {
      const contentLength = parseInt(contentLengthMatch[1], 10);
      return this.data.length >= headerEnd + 4 + contentLength;
    }

    return true;
  }

  getData(): Buffer {
    return this.data;
  }
}

export { ConnectionBuffer };

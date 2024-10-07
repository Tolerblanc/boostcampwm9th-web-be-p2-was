class ConnectionBuffer {
  private _data: Buffer;
  private _size: number;
  private readonly maxSize: number;

  constructor(maxSize: number = 1024 * 1024 * 10) {
    this._data = Buffer.alloc(0);
    this._size = 0;
    this.maxSize = maxSize;
  }

  addChunk(chunk: Buffer): number {
    if (this._size + chunk.length > this.maxSize) {
      return -1;
    }
    this._data = Buffer.concat([this._data, chunk]);
    this._size += chunk.length;
    return chunk.length;
  }

  clear() {
    this._data = Buffer.alloc(0);
    this._size = 0;
  }

  isCompleteHttpRequest(): boolean {
    const str = this._data.toString();
    const headerEnd = str.indexOf("\r\n\r\n");

    if (headerEnd === -1) return false;

    const contentLengthMatch = str.match(/Content-Length: (\d+)/i);
    if (contentLengthMatch) {
      const contentLength = parseInt(contentLengthMatch[1], 10);
      return this._data.length >= headerEnd + 4 + contentLength;
    }

    return true;
  }

  get size(): number {
    return this._size;
  }

  toString(): string {
    return this._data.toString();
  }
}

export { ConnectionBuffer };

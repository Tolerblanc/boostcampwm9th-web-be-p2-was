import { parseRequestData } from "@/util/requestParser";

class Request {
  accessor protocol: string;
  accessor method: string;
  accessor uri: string;
  accessor endpoint: string;
  accessor query: Record<string, string>;

  constructor(data: string) {
    const { protocol, method, uri, endpoint, query } = parseRequestData(data);
    this.protocol = protocol;
    this.method = method;
    this.uri = uri;
    this.endpoint = endpoint;
    this.query = query;
  }

  toString() {
    return `${this.protocol} ${this.method} ${this.uri}`;
  }
}

export { Request };

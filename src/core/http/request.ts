class Request {
  accessor protocol: string;
  accessor method: string;
  accessor path: string;
  accessor query: Record<string, string>;
  accessor headers: Record<string, string>;
  accessor body: Record<string, string>; // ? 본래 Body는 여러 타입이 올 수 있지만, JSON 만 받는다고 가정
  accessor params: Record<string, string | number | boolean>;

  constructor(data: string) {
    const { protocol, method, path, query, body, headers } =
      this.parseRequestData(data);
    this.protocol = protocol;
    this.method = method;
    this.path = path;
    this.query = query;
    this.headers = headers;
    this.body = this.parseBody(body);
    this.params = {};
  }

  private parseBody(body: string) {
    if (this.method === "GET" || this.method === "DELETE" || !body) return {};
    return JSON.parse(body);
  }

  private parseQueryParameters(str: string | undefined) {
    if (!str) return {};
    return Object.fromEntries(new URLSearchParams(str));
  }

  private parseRequestData(data: string) {
    const [requestHeader, body] = data.toString().split("\r\n\r\n");
    const [firstLine, ...remainders] = requestHeader.split("\r\n");
    const headers = Object.fromEntries(
      remainders.map((line) => line.split(": "))
    );
    const [method, fullPath, protocol] = firstLine.split(" ");
    const [path, queryString] = fullPath.split("?");
    const query = this.parseQueryParameters(queryString);

    return { protocol, method, path, query, body, headers };
  }

  toString() {
    return `${this.method} ${this.path} ${this.protocol}`;
  }
}

export { Request };

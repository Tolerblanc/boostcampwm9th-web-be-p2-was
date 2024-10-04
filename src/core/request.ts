class Request {
  accessor protocol: string;
  accessor method: string;
  accessor uri: string;
  accessor endpoint: string;
  accessor query: Record<string, string>;
  accessor body: Record<string, string>;

  constructor(data: string) {
    const { protocol, method, uri, endpoint, query, body } =
      this.parseRequestData(data);
    this.protocol = protocol;
    this.method = method;
    this.uri = uri;
    this.endpoint = endpoint;
    this.query = query;
    this.body = this.parseBody(body);
  }

  private parseBody(body: string) {
    // ! JSON 형태로 데이터가 들어온다고 가정
    // TODO: GET 요청에서 body가 들어오는 경우 무시하도록 처리
    if (body) return JSON.parse(body);
    else return {};
  }

  private parseQueryParameters(str: string | undefined) {
    if (!str) {
      return {};
    }

    const queries = str.split("&").map((data) => data.split("="));

    return queries.reduce<Record<string, string>>((acc, cur) => {
      const [key, value] = cur;

      acc[key] = value;

      return acc;
    }, {});
  }

  private parseRequestData(data: string) {
    const [requestHeader, body] = data.toString().split("\r\n\r\n");
    const [firstLine] = requestHeader.split("\r\n");
    const [method, uri, protocol] = firstLine.split(" ");

    const [endpoint, queryString] = uri.split("?");

    const query = this.parseQueryParameters(queryString);

    return { protocol, method, uri, endpoint, query, body };
  }

  toString() {
    return `${this.protocol} ${this.method} ${this.uri}`;
  }
}

export { Request };

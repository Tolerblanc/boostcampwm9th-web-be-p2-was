import { parseRequestData } from "@/util/requestParser";

class Request {
  accessor protocol: string;
  accessor method: string;
  accessor uri: string;
  accessor endpoint: string;
  accessor query: Record<string, string>;
  accessor body: Record<string, string>;

  constructor(data: string) {
    const { protocol, method, uri, endpoint, query, body } =
      parseRequestData(data);
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

  toString() {
    return `${this.protocol} ${this.method} ${this.uri}`;
  }
}

export { Request };

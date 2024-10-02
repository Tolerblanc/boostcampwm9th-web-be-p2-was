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
    //! 쿼리 파라미터 형태의 데이터가 x-www-form-urlencoded or json 형식으로 전달된다고 가정
    //TODO: 다양한 형식의 데이터 처리 로직 고려
    return body.split("&").reduce<Record<string, string>>((acc, cur) => {
      const [key, value] = cur.split("=");
      acc[key] = value;
      return acc;
    }, {});
  }

  toString() {
    return `${this.protocol} ${this.method} ${this.uri}`;
  }
}

export { Request };

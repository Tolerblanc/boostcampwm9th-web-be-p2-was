function parseQueryParameters(str: string | undefined) {
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

function parseRequestData(data: string) {
  const [requestHeader] = data.toString().split("\r\n\r\n");
  const [firstLine] = requestHeader.split("\r\n");
  const [method, uri, protocol] = firstLine.split(" ");

  const [endpoint, queryString] = uri.split("?");

  const query = parseQueryParameters(queryString);

  return { protocol, method, uri, endpoint, query };
}

export { parseRequestData };

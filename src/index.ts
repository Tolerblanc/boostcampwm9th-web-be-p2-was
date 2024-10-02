import { WasApplication } from "./core/app";
import { createUser } from "./users/createUser";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

async function createHandler(request: Request, response: Response) {
  //TODO: 컨트롤러로 분리
  const newUser = await createUser(request.query);

  response.ok().contentType("json").data(JSON.stringify(newUser)).send();
}

function redirectToIndex(request: Request, response: Response) {
  response.redirect("/index.html").send();
}

function bootstrap() {
  const app = new WasApplication();

  app.get("/", redirectToIndex);
  app.get("/create", createHandler);

  app.listen(3000);
}

bootstrap();

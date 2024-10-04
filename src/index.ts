import { WasApplication } from "./core/app";
import { createUser } from "./users/createUser";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

async function createHandler(request: Request, response: Response) {
  //TODO: 컨트롤러로 분리
  const newUser = await createUser(request.body);

  response.created().contentType("json").data(newUser).send();
}

function redirectToIndex(request: Request, response: Response) {
  response.redirect("/index.html").send();
}

function bootstrap() {
  const app = new WasApplication();

  app.get("/", redirectToIndex);
  app.post("/create", createHandler);

  app.listen(3000);
}

bootstrap();

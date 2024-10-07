import { WasApplication } from "./core/app";
import { createUser } from "./user/createUser";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { login } from "./user/login";

async function createHandler(request: Request, response: Response) {
  //TODO: 컨트롤러로 분리
  const newUser = await createUser(request.body);

  response.created().contentType("json").data(newUser).send();
}

async function loginHandler(request: Request, response: Response) {
  const username = await login(request.body);
  response.cookie("username", username).redirect("/").send();
}

function redirectToIndex(request: Request, response: Response) {
  response.redirect("/index.html").send();
}

function bootstrap() {
  const app = new WasApplication();

  app.get("/", redirectToIndex);
  app.post("/create", createHandler);
  app.post("/login", loginHandler);

  app.listen(3000);
}

bootstrap();

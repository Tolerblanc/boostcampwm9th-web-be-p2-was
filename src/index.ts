import { WasApplication } from "./core/app";
import { createUser } from "./user/createUser";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { login } from "@/user/login";
import { UserController } from "@/user/user.controller";
import { handleStaticFileRoute } from "./core/builtin/staticFile.middleware";

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

  app.use(handleStaticFileRoute);
  app.registerControllers(UserController);

  app.listen(3000);
}

bootstrap();

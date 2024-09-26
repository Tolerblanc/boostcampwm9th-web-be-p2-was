import { WasApplication } from "./core/app";
import { createUser } from "./users/createUser";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

async function createHandler(request: Request, response: Response) {
  const newUser = await createUser(request.query);

  response.contentType = "json";
  response.data = JSON.stringify(newUser);
  response.send();
}

function bootstrap() {
  const app = new WasApplication();

  app.get("/create", createHandler);

  app.listen(3000);
}

bootstrap();

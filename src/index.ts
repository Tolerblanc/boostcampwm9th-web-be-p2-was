import { WasApplication } from "./core/app";
import { createUser } from "./users/createUser";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

async function createHandler(request: Request, response: Response) {
  const newUser = await createUser(request.query);

  response
    .status(200)
    .message("OK")
    .contentType("json")
    .data(JSON.stringify(newUser))
    .send();
}

function bootstrap() {
  const app = new WasApplication();

  app.get("/create", createHandler);

  app.listen(3000);
}

bootstrap();

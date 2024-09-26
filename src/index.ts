import { WasApplication } from "./core/app";
import { Router } from "@/core/router";
import { createUser } from "./users/createUser";

function bootstrap() {
  const app = WasApplication.create();
  //   const router = new Router();
  //   router.get("/index.html");
  //   router.get("/form.html");
  //   router.get("/create");

  //   app.use(router.handle);

  app.listen(3000);
}

bootstrap();

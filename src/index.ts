import { WasApplication } from "./core/app";
import { UserController } from "@/user/user.controller";
import { IndexController } from "@/index.controller";

function bootstrap() {
  const app = new WasApplication();

  app.registerControllers(IndexController);
  app.registerControllers(UserController);

  app.listen(3000);
}

bootstrap();

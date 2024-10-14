import "reflect-metadata";
import { WasApplication } from "./core/app";
import { UserController } from "@/user/user.controller";
import { IndexController } from "@/index.controller";
import { handleStaticFileRoute } from "./core/builtin/staticFile.middleware";
import { BoardController } from "./board/board.controller";

function bootstrap() {
  const app = new WasApplication();

  app.use(handleStaticFileRoute);
  app.registerControllers(IndexController);
  app.registerControllers(UserController);
  app.registerControllers(BoardController);

  app.listen(3000);
}

bootstrap();

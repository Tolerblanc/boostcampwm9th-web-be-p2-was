import "reflect-metadata";
import { WasApplication } from "./core/app";
import { UserController } from "@/user/user.controller";
import { IndexController } from "@/index.controller";
import { handleStaticFileRoute } from "@/core/builtin/staticFile.middleware";
import { BoardController } from "@/board/board.controller";
import { CommentController } from "@/comment/comment.controller";
import { AuthController } from "@/auth/auth.controller";

function bootstrap() {
  const app = new WasApplication();

  app.use(handleStaticFileRoute);
  app.registerControllers(
    IndexController,
    AuthController,
    UserController,
    BoardController,
    CommentController
  );

  app.listen(3000);
}

bootstrap();

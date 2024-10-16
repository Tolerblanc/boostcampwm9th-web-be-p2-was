import { Controller, Post, UseMiddleware } from "@/core/util/decorators";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { CommentService } from "@/comment/comment.service";
import { CommentRepository } from "@/comment/comment.repository";
import { AuthenticationMiddleware } from "@/core/builtin/authentication.middleware";
import { BoardRepository } from "@/board/board.repository";
import { UserRepository } from "@/user/user.repository";

@Controller("/comment")
class CommentController {
  private readonly commentService: CommentService;
  constructor() {
    //TODO: 생성자 기반 의존성 주입
    this.commentService = new CommentService(
      BoardRepository,
      UserRepository,
      CommentRepository
    );
  }

  @Post("/:boardId")
  @UseMiddleware(AuthenticationMiddleware)
  async createComment(req: Request, res: Response) {
    const boardId = Number(req.params.boardId);
    const userId = Number(req.params.userId);
    const { content } = req.body;
    const comment = await this.commentService.createComment(
      boardId,
      userId,
      content
    );
    res.created().data({ content: comment.content }).send();
  }
}

export { CommentController };

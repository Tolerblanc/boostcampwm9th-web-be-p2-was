import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseMiddleware,
} from "@/core/util/decorators";
import { BoardService } from "@/board/board.service";
import { BoardRepository } from "@/board/board.repository";
import { IsAuthenticated } from "@/core/builtin/isAuthenticated.middleware";
import { IsBoardAuthor } from "@/util/isBoardAuthor.middleware";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { User } from "@/user/user.entity";

@Controller("/board")
class BoardController {
  private readonly boardService: BoardService;
  constructor() {
    //TODO: 생성자 기반 의존성 주입
    this.boardService = new BoardService(BoardRepository);
  }

  @Get("/write")
  @UseMiddleware(IsAuthenticated)
  async getWritePage(req: Request, res: Response) {
    res.redirect("/write.html").send();
  }

  @Post("/")
  @UseMiddleware(IsAuthenticated)
  async createBoard(req: Request, res: Response) {
    const { title, content } = req.body;
    const board = await this.boardService.createBoard({
      title,
      content,
      author: { id: Number(req.params.userId) } as User,
    });
    res.status(201).data(board).send();
  }

  @Get("/") //board?page=1&limit=10
  async getBoardList(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await this.boardService.getBoardList(page, limit);
    res.data(result).send();
  }

  @Get("/:id")
  async getBoardDetail(req: Request, res: Response) {
    const boardId = parseInt(req.params.id as string);
    const board = await this.boardService.getBoardById(boardId);
    res.data(board).send();
  }

  @Patch("/:id")
  @UseMiddleware(IsAuthenticated)
  @UseMiddleware(IsBoardAuthor)
  async updateBoard(req: Request, res: Response) {
    const boardId = parseInt(req.params.id as string);
    const { title, content } = req.body;
    const updatedBoard = await this.boardService.updateBoard(boardId, {
      title,
      content,
    });
    res.data(updatedBoard).send();
  }

  @Delete("/:id")
  @UseMiddleware(IsAuthenticated)
  @UseMiddleware(IsBoardAuthor)
  async deleteBoard(req: Request, res: Response) {
    const boardId = parseInt(req.params.id as string);
    await this.boardService.deleteBoard(boardId);
    res.status(204).send();
  }
}

export { BoardController };

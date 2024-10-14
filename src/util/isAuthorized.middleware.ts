import { MiddlewareFunction, NextFunction } from "@/core/util/middleware";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { ForbiddenError } from "@/core/http/httpError";
import { BoardRepository } from "@/board/board.repository";

const IsAuthorized: MiddlewareFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const boardId = Number(req.params.boardId);
  const board = await BoardRepository.findById(boardId);
  const userId = Number(req.params.userId);
  if (board?.author.id !== userId) {
    throw new ForbiddenError();
  }
  next();
};

export { IsAuthorized };

import { BoardRepository } from "@/board/board.repository";
import { CommentRepository } from "@/comment/comment.repository";
import { BadRequestError } from "@/core/http/httpError";
import { UserRepository } from "@/user/user.repository";

class CommentService {
  constructor(
    private readonly boardRepository: typeof BoardRepository,
    private readonly userRepository: typeof UserRepository,
    private readonly commentRepository: typeof CommentRepository
  ) {}

  async createComment(boardId: number, userId: number, content: string) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new BadRequestError("게시글을 찾을 수 없습니다.");
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("사용자를 찾을 수 없습니다.");
    }
    const comment = await this.commentRepository.createComment(
      boardId,
      userId,
      content
    );
    return comment;
  }
}

export { CommentService };

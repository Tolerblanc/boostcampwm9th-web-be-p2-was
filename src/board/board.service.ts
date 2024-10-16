import { Board } from "@/board/board.entity";
import { BoardRepository } from "@/board/board.repository";
import { NotFoundError } from "@/core/http/httpError";

class BoardService {
  constructor(private readonly boardRepository: typeof BoardRepository) {}

  async createBoard(boardData: Partial<Board>): Promise<Board> {
    return this.boardRepository.createBoard(boardData);
  }

  async getBoardList(page: number, limit: number) {
    const [boards, total] = await this.boardRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);
    return { boards, total, totalPages, currentPage: page };
  }

  async getBoardById(boardId: number): Promise<Board> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }
    return board;
  }

  async updateBoard(
    boardId: number,
    boardData: Partial<Board>
  ): Promise<Board> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }
    return this.boardRepository.updateBoard(boardId, boardData);
  }

  async deleteBoard(boardId: number): Promise<void> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }
    await this.boardRepository.delete(boardId);
  }
}

export { BoardService };

import { BoardService } from "@/board/board.service";
import { BoardRepository } from "@/board/board.repository";
import { Board } from "@/board/board.entity";
import { NotFoundError } from "@/core/http/httpError";
import { DeleteResult } from "typeorm";

jest.mock("@/board/board.repository");

describe("BoardService", () => {
  let boardService: BoardService;
  let mockBoardRepository: jest.Mocked<typeof BoardRepository>;

  beforeEach(() => {
    mockBoardRepository = BoardRepository as jest.Mocked<
      typeof BoardRepository
    >;
    boardService = new BoardService(mockBoardRepository);
  });

  describe("createBoard", () => {
    it("게시글을 생성해야 한다", async () => {
      const boardData = { title: "테스트 제목", content: "테스트 내용" };
      const expectedBoard = { id: 1, ...boardData } as Board;

      mockBoardRepository.createBoard.mockResolvedValue(expectedBoard);

      const result = await boardService.createBoard(boardData);

      expect(mockBoardRepository.createBoard).toHaveBeenCalledWith(boardData);
      expect(result).toEqual(expectedBoard);
    });
  });

  describe("getBoardList", () => {
    it("페이지네이션된 게시글 목록을 반환해야 한다", async () => {
      const page = 1;
      const limit = 10;
      const boards = [{ id: 1, title: "테스트 게시글" }] as Board[];
      const total = 1;

      mockBoardRepository.findAll.mockResolvedValue([boards, total]);

      const result = await boardService.getBoardList(page, limit);

      expect(mockBoardRepository.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        boards,
        total,
        totalPages: 1,
        currentPage: page,
      });
    });
  });

  describe("getBoardById", () => {
    it("존재하는 게시글 ID로 게시글을 조회해야 한다", async () => {
      const boardId = 1;
      const expectedBoard = { id: boardId, title: "테스트 게시글" } as Board;

      mockBoardRepository.findById.mockResolvedValue(expectedBoard);

      const result = await boardService.getBoardById(boardId);

      expect(mockBoardRepository.findById).toHaveBeenCalledWith(boardId);
      expect(result).toEqual(expectedBoard);
    });

    it("존재하지 않는 게시글 ID로 조회 시 NotFoundError를 던져야 한다", async () => {
      const boardId = 999;

      mockBoardRepository.findById.mockResolvedValue(null);

      await expect(boardService.getBoardById(boardId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateBoard", () => {
    it("존재하는 게시글을 수정해야 한다", async () => {
      const boardId = 1;
      const updateData = { title: "수정된 제목", content: "수정된 내용" };
      const existingBoard = {
        id: boardId,
        title: "원래 제목",
        content: "원래 내용",
      } as Board;
      const updatedBoard = { ...existingBoard, ...updateData };

      mockBoardRepository.findById.mockResolvedValue(existingBoard);
      mockBoardRepository.updateBoard.mockResolvedValue(updatedBoard);

      const result = await boardService.updateBoard(boardId, updateData);

      expect(mockBoardRepository.findById).toHaveBeenCalledWith(boardId);
      expect(mockBoardRepository.updateBoard).toHaveBeenCalledWith(
        boardId,
        updateData
      );
      expect(result).toEqual(updatedBoard);
    });

    it("존재하지 않는 게시글 수정 시 NotFoundError를 던져야 한다", async () => {
      const boardId = 999;
      const updateData = { title: "수정된 제목" };

      mockBoardRepository.findById.mockResolvedValue(null);

      await expect(
        boardService.updateBoard(boardId, updateData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteBoard", () => {
    it("존재하는 게시글을 삭제해야 한다", async () => {
      const boardId = 1;
      const existingBoard = { id: boardId, title: "삭제할 게시글" } as Board;

      mockBoardRepository.findById.mockResolvedValue(existingBoard);
      mockBoardRepository.delete.mockResolvedValue(
        undefined as unknown as DeleteResult
      );

      await boardService.deleteBoard(boardId);

      expect(mockBoardRepository.findById).toHaveBeenCalledWith(boardId);
      expect(mockBoardRepository.delete).toHaveBeenCalledWith(boardId);
    });

    it("존재하지 않는 게시글 삭제 시 NotFoundError를 던져야 한다", async () => {
      const boardId = 999;

      mockBoardRepository.findById.mockResolvedValue(null);

      await expect(boardService.deleteBoard(boardId)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});

import { dataSource } from "@/core/util/dataSource";
import { Board } from "@/board/board.entity";

const BoardRepository = dataSource.getRepository(Board).extend({
  async findByUserId(userId: number) {
    return this.find({
      where: { author: { id: userId } },
    });
  },

  async findById(id: number) {
    return this.findOne({
      where: { id },
      relations: ["author", "comments"],
    });
  },

  async findAll(page: number, limit: number) {
    return this.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["author"],
    });
  },

  async createBoard(boardData: Partial<Board>) {
    const board = this.create(boardData);
    return this.save(board) as Promise<Board>;
  },

  async updateBoard(id: number, boardData: Partial<Board>) {
    await this.update(id, boardData);
    return this.findById(id) as Promise<Board>;
  },
});

export { BoardRepository };

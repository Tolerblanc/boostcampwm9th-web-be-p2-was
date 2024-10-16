import { dataSource } from "@/core/util/dataSource";
import { Comment } from "@/comment/comment.entity";

const CommentRepository = dataSource.getRepository(Comment).extend({
  async findByBoardId(boardId: number) {
    return this.find({
      where: { board: { id: boardId } },
    });
  },

  async createComment(boardId: number, userId: number, content: string) {
    const comment = this.create({
      content,
      board: { id: boardId },
      author: { id: userId },
    });
    await this.save(comment);
    return comment;
  },
});

export { CommentRepository };

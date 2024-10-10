import { Board } from "@/board/board.entity";
import { User } from "@/user/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.boards)
  author!: User;

  @ManyToOne(() => Board, (board) => board.comments)
  board!: Board;
}

export { Comment };

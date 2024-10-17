import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "@/user/user.entity";
import { Comment } from "@/comment/comment.entity";

@Entity()
class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "integer", default: 0 })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.boards)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.board)
  comments: Comment[];
}

export { Board };

import "reflect-metadata";
import { DataSource } from "typeorm";

import { Board } from "@/board/board.entity";
import { User } from "@/user/user.entity";
import { Comment } from "@/comment/comment.entity";

const dataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  entities: [User, Board, Comment],
  synchronize: true,
});

export { dataSource };

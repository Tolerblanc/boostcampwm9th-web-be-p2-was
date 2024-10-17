import "reflect-metadata";
import { DataSource } from "typeorm";

import { Board } from "@/board/board.entity";
import { User } from "@/user/user.entity";
import { Comment } from "@/comment/comment.entity";
import dotenv from "dotenv";

dotenv.config();

const dataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_NAME as string,
  entities: [User, Board, Comment],
  synchronize: true,
  logging: Boolean(process.env.QUERY_LOGGING),
});

export { dataSource };

import "reflect-metadata";
import { Board } from "@/board/board.entity";
import { User } from "@/user/user.entity";
import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  entities: [User, Board],
  synchronize: true,
});

export { dataSource };

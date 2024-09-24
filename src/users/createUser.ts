import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getDirname } from "@/util/getDirname";
import { CustomError } from "@/util/customError";

type TUser = {
  userId: string;
  name: string;
  email: string;
  password: string;
};

const __dirname = getDirname(import.meta.url);

function createUser(query: Record<string, string>) {
  const { userId, password, name, email } = query;

  if (!userId || !password || !name || !email) {
    throw new CustomError({ status: 400, message: "Bad Request" });
  }

  const rootDir = join(__dirname, "../../");
  const dbPath = join(rootDir, "db", "user.json");

  const users = JSON.parse(readFileSync(dbPath).toString()) as TUser[];

  const existUser = users.find((user) => {
    return user.name === name || user.userId === userId || user.email === email;
  });

  if (existUser) {
    throw new CustomError({ status: 409, message: "Aleady Exist" });
  }

  const newUser: TUser = { userId, password, email, name };

  users.push(newUser);

  writeFileSync(dbPath, JSON.stringify(users));

  return { userId, email, name };
}

export { createUser };

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getDirname } from "@/core/util/getDirname";
import { BadRequestError, ConflictError } from "@/core/util/httpError";

type User = {
  nickname: string;
  email: string;
  password: string;
};

const __dirname = getDirname(import.meta.url);

function validateQuery(query: Record<string, string>) {
  const { password, nickname, email } = query;

  if (!password) throw new BadRequestError("Password is required");
  if (!nickname) throw new BadRequestError("Nickname is required");
  if (!email) throw new BadRequestError("Email is required");

  return { password, nickname, email };
}

async function createUser(query: Record<string, string>) {
  const { password, nickname, email } = validateQuery(query);
  const rootDir = join(__dirname, "../../");
  const dbPath = join(rootDir, "db", "user.json");

  const users = JSON.parse((await readFile(dbPath)).toString()) as User[];

  const existUser = users.find((user) => {
    return user.nickname === nickname || user.email === email;
  });

  if (existUser) {
    throw new ConflictError("Aleady Exist");
  }

  const newUser: User = { password, email, nickname };

  users.push(newUser);

  await writeFile(dbPath, JSON.stringify(users));

  return { email, nickname };
}

export { createUser, type User };

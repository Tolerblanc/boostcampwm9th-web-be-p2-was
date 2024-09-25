import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getDirname } from "@/util/getDirname";
import { BadRequestError, ConflictError } from "@/util/httpError";

type User = {
  userId: string;
  name: string;
  email: string;
  password: string;
};

const __dirname = getDirname(import.meta.url);

async function createUser(query: Record<string, string>) {
  const { userId, password, name, email } = query;

  if (!userId || !password || !name || !email) {
    throw new BadRequestError();
  }

  const rootDir = join(__dirname, "../../");
  const dbPath = join(rootDir, "db", "user.json");

  const users = JSON.parse((await readFile(dbPath)).toString()) as User[];

  const existUser = users.find((user) => {
    return user.name === name || user.userId === userId || user.email === email;
  });

  if (existUser) {
    throw new ConflictError("Aleady Exist");
  }

  const newUser: User = { userId, password, email, name };

  users.push(newUser);

  await writeFile(dbPath, JSON.stringify(users));

  return { userId, email, name };
}

export { createUser };

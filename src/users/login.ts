import { readFile } from "fs/promises";
import { join } from "path";

import { getDirname } from "@/core/util/getDirname";
import { User } from "./createUser";
import { BadRequestError, UnauthorizedError } from "@/core/util/httpError";

const __dirname = getDirname(import.meta.url);

function validateQuery(query: Record<string, string>) {
  const { email, password } = query;
  if (!email || !password)
    throw new BadRequestError("Invalid email or password");
  return { email: encodeURIComponent(email), password };
}

async function login(query: Record<string, string>) {
  const { email, password } = validateQuery(query);

  const rootDir = join(__dirname, "../../");
  const dbPath = join(rootDir, "db", "user.json");

  const users = JSON.parse((await readFile(dbPath)).toString()) as User[];

  const user = users.find((user) => user.email === email);
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const isPasswordCorrect = password === user.password;
  if (!isPasswordCorrect)
    throw new UnauthorizedError("Invalid email or password");

  // TODO: 세션 생성
  return user.nickname;
}

export { login };

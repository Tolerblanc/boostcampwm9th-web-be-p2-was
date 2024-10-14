import { BadRequestError, UnauthorizedError } from "@/core/http/httpError";
import { UserRepository } from "./user.repository";
import type SessionStore from "@/core/util/sessionStore";

class UserService {
  constructor(
    private readonly userRepository: typeof UserRepository,
    private readonly sessionStore: typeof SessionStore
  ) {}

  async getUserList() {
    const userList = await this.userRepository.list();
    return userList.map((user) => {
      return {
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      };
    });
  }

  private validateLoginBody(body: Record<string, string>) {
    const { email, password } = body;
    if (!email || !password)
      throw new BadRequestError("Invalid email or password");
    //TODO: 이메일 형식 검증 필요
    return { email, password };
  }

  async login(body: Record<string, string>) {
    const { email, password } = this.validateLoginBody(body);
    const user = await this.userRepository.findByEmail(email);
    const isPasswordCorrect = password === user?.password;
    if (!user || !isPasswordCorrect)
      throw new UnauthorizedError("Invalid email or password");
    const sessionId = this.sessionStore.create(user.id, user.nickname);
    return sessionId;
  }

  async create(body: Record<string, string>) {
    //TODO: 추가 검증 로직 필요
    //TODO: 패스워드 암호화 필요
    const user = await this.userRepository.createUser({
      email: body.email,
      password: body.password,
      nickname: body.nickname,
    });
    return {
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
    };
  }
}

export { UserService };

import { BadRequestError, UnauthorizedError } from "@/core/http/httpError";
import { UserRepository } from "./user.repository";
import type SessionStore from "@/core/util/sessionStore";

class UserService {
  constructor(
    private readonly userRepository: typeof UserRepository,
    private readonly sessionStore: typeof SessionStore
  ) {}

  async getUserInfo(userId: number) {
    const user = await this.userRepository.findById(userId);
    return {
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
    };
  }

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

  async create(body: Record<string, string>) {
    //TODO: 추가 검증 로직 필요
    //TODO: 패스워드 암호화 필요
    const isEssentialFieldEmpty = Object.values(body).some(
      (value) => value === ""
    );

    if (isEssentialFieldEmpty)
      throw new BadRequestError("All fields are required");

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

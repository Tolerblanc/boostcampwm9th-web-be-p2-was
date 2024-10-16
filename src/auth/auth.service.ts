import { BadRequestError, UnauthorizedError } from "@/core/http/httpError";
import type { UserRepository } from "@/user/user.repository";
import SessionStore from "@/core/util/sessionStore";

class AuthService {
  constructor(
    private readonly userRepository: typeof UserRepository,
    private readonly sessionStore: typeof SessionStore
  ) {}

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
}

export { AuthService };

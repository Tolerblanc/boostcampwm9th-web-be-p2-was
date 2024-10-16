import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "@/core/http/httpError";
import type { UserRepository } from "@/user/user.repository";
import SessionStore from "@/core/util/sessionStore";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import type { User } from "@/user/user.entity";

dotenv.config();

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

  async githubOAuthLogin(code: string) {
    const accessToken = await this.getGitHubAccessToken(code);
    const { email, nickname } = await this.getGitHubUser(accessToken);

    let user: User;
    try {
      user = await this.userRepository.findByEmail(email);
    } catch (error) {
      if (error instanceof InternalServerError) {
        user = await this.userRepository.createUser({
          email: email,
          password: randomUUID(),
          nickname: nickname,
        });
      }
    }
    const sessionId = this.sessionStore.create(user!.id, user!.nickname);
    return sessionId;
  }

  private async getGitHubAccessToken(code: string): Promise<string> {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const data = await response.json();
    return data.access_token;
  }

  private async getGitHubUser(
    accessToken: string
  ): Promise<{ email: string; nickname: string }> {
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userResponseData = await userResponse.json();

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const emailResponseData = await emailResponse.json();

    const primaryEmail = emailResponseData.find(
      (email: { primary: boolean; email: string }) => email.primary
    ).email;

    return { email: primaryEmail, nickname: userResponseData.login };
  }
}

export { AuthService };

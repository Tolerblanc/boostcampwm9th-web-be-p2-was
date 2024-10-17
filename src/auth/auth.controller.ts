import { Controller, Get, Post } from "@/core/util/decorators";
import sessionStore from "@/core/util/sessionStore";
import { UserRepository } from "@/user/user.repository";
import { AuthService } from "@/auth/auth.service";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import dotenv from "dotenv";

dotenv.config();

@Controller("/auth")
class AuthController {
  private readonly authService: AuthService;
  constructor() {
    //TODO: 생성자 기반 의존성 주입
    this.authService = new AuthService(UserRepository, sessionStore);
  }

  @Post("/login")
  async login(req: Request, res: Response): Promise<void> {
    const token = await this.authService.login(req.body);
    res
      .ok()
      .contentType("json")
      .data({
        redirectUrl: req.query.redirectUrl ?? "/",
        token,
      })
      .send();
  }

  @Get("/github")
  async githubLogin(req: Request, res: Response): Promise<void> {
    //TODO: URL 분리
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(githubAuthUrl).send();
  }

  @Get("/github/callback")
  async githubCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code;
    const token = await this.authService.githubOAuthLogin(code);
    res.redirect(`/index.html?token=${token}`).send();
  }

  @Post("/logout")
  logout(req: Request, res: Response): void {
    const token = req.headers.authorization;
    this.authService.logout(token);
    res.redirect("/").send();
  }
}

export { AuthController };

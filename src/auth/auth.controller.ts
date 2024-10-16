import { Controller, Get, Post } from "@/core/util/decorators";
import sessionStore from "@/core/util/sessionStore";
import { UserRepository } from "@/user/user.repository";
import { AuthService } from "@/auth/auth.service";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";

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
}

export { AuthController };

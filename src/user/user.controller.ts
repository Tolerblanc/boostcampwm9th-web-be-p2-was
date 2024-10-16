import { Controller, Get, Post, UseMiddleware } from "@/core/util/decorators";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { AuthenticationMiddleware } from "@/core/builtin/authentication.middleware";
import SessionStore from "@/core/util/sessionStore";

@Controller("/user")
class UserController {
  private readonly userService: UserService;
  constructor() {
    //TODO: 생성자 기반 의존성 주입
    this.userService = new UserService(UserRepository, SessionStore);
  }

  @Get("/me")
  @UseMiddleware(AuthenticationMiddleware)
  async getMe(req: Request, res: Response): Promise<void> {
    const user = await this.userService.getUserInfo(Number(req.params.userId));
    res.ok().data(user).send();
  }

  @Get("/list")
  @UseMiddleware(AuthenticationMiddleware)
  async getUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getUserList();
    res.status(200).data(users).send();
  }

  @Post("/create")
  async createUser(req: Request, res: Response): Promise<void> {
    const newUser = await this.userService.create(req.body);
    res.created().contentType("json").data(newUser).send();
  }
}

export { UserController };

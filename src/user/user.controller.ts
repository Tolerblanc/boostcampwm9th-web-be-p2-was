import { Controller, Get, Post } from "@/core/util/decorators";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";

@Controller("/user")
class UserController {
  private readonly userService: UserService;
  constructor() {
    //TODO: 생성자 기반 의존성 주입
    this.userService = new UserService(UserRepository);
  }

  @Get("/list")
  async getUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getUserList();
    res.status(200).data(users).send();
  }

  @Post("/login")
  async login(req: Request, res: Response): Promise<void> {
    const token = await this.userService.login(req.body);
    res.redirect("/").data({ token }).send();
  }

  @Post("/create")
  async createUser(req: Request, res: Response): Promise<void> {
    const newUser = await this.userService.create(req.body);
    res.created().contentType("json").data(newUser).send();
  }
}

export { UserController };
import { Controller, Get, Post } from "@/core/util/decorators";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { createUser } from "@/user/createUser";
import { login } from "./login";

@Controller("/user")
class UserController {
  @Get("/")
  async getUsers(req: Request, res: Response): Promise<void> {
    res.status(200).data({ message: "Users list" }).send();
  }

  @Post("/login")
  async login(req: Request, res: Response): Promise<void> {
    //TODO: 서비스 레이어 분리
    const username = await login(req.body);
    res.cookie("username", username).redirect("/").send();
  }

  @Post("/create")
  async createUser(req: Request, res: Response): Promise<void> {
    //TODO: 서비스 레이어 분리
    const newUser = await createUser(req.body);
    res.created().contentType("json").data(newUser).send();
  }

  @Get("/:id/detail")
  async getUser(req: Request, res: Response) {
    const userId = req.params.id;
    res
      .status(200)
      .data({ message: `User ${userId} details` })
      .send();
  }
}

export { UserController };

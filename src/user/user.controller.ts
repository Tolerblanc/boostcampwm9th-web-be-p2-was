import { Controller, Get, Post } from "@/core/util/decorators";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";

@Controller("/user")
class UserController {
  @Get("/")
  async getUsers(req: Request, res: Response): Promise<void> {
    res.status(200).data({ message: "Users list" }).send();
  }

  @Post("/")
  async createUser(req: Request, res: Response): Promise<void> {
    res.status(201).data({ message: "User created" }).send();
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

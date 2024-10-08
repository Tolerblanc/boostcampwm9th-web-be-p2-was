import { Controller } from "@/core/util/decorators";
import { Get } from "@/core/util/decorators";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";

@Controller()
class IndexController {
  @Get("/")
  index(req: Request, res: Response): void {
    res.redirect("/index.html").send();
  }
}

export { IndexController };

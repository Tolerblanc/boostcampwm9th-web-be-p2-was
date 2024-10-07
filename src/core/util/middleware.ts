import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";

type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: () => void
) => void | Promise<void>;

class Middleware {
  private handlers: MiddlewareHandler[];
  constructor() {
    this.handlers = [];
  }

  use(handler: MiddlewareHandler) {
    this.handlers.push(handler);
  }

  handle(req: Request, res: Response): Promise<void> {
    const chainedHandler = async (index: number) => {
      if (index === this.handlers.length) {
        return;
      }
      await this.handlers[index](req, res, () => chainedHandler(index + 1));
    };
    return chainedHandler(0);
  }
}

export { MiddlewareHandler, Middleware };

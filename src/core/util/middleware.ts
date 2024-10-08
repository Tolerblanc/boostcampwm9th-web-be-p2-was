import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";

type NextFunction = () => void | Promise<void>;

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type { MiddlewareFunction, NextFunction };

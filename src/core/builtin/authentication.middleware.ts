import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { NextFunction, MiddlewareFunction } from "@/core/util/middleware";
import { UnauthorizedError } from "@/core/http/httpError";
import SessionStore from "@/core/util/sessionStore";

const AuthenticationMiddleware: MiddlewareFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.Authorization?.split(" ")[1];
  const session = SessionStore.get(token);
  if (!session) {
    return next(new UnauthorizedError());
  }
  req.params.userId = session.userId;
  req.params.userName = session.userName;
  return next();
};

export { AuthenticationMiddleware };

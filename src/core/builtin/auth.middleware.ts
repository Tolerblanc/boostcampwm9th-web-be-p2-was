import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { NextFunction, MiddlewareFunction } from "@/core/util/middleware";
import { UnauthorizedError } from "@/core/http/httpError";
import SessionStore from "@/core/util/sessionStore";

const AuthMiddleware: MiddlewareFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  const session = SessionStore.get(token);
  if (!session) {
    throw new UnauthorizedError();
  }
  req.params.userId = session.userId;
  req.params.userName = session.userName;
  next();
};

export { AuthMiddleware };

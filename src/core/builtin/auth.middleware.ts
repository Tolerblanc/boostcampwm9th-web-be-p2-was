import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { NextFunction, MiddlewareFunction } from "@/core/util/middleware";
import SessionStore from "@/core/util/sessionStore";

const AuthMiddleware: MiddlewareFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  const session = SessionStore.get(token);
  if (!session) {
    res.redirect(`/login.html?redirectUrl=${req.path}`).send();
    return;
  }
  req.params.userId = session.userId;
  req.params.userName = session.userName;
  next();
};

export { AuthMiddleware };

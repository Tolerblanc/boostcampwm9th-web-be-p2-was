import { v4 as uuidv4 } from "uuid";

type Session = {
  userId: number;
  userName: string;
  expiredAt: number;
};

class SessionStore {
  private session: Map<string, Session>;
  constructor() {
    this.session = new Map();
  }

  create(userId: number, userName: string) {
    const sessionId = uuidv4();
    const session = {
      userId,
      userName,
      expiredAt:
        Date.now() +
        +(process.env.SESSION_EXPIRATION_TIME ?? 1000 * 60 * 60 * 24 * 7),
    };
    this.session.set(sessionId, session);
    return sessionId;
  }

  get(sessionId: string) {
    const session = this.session.get(sessionId);
    if (!session) return null;
    if (session.expiredAt < Date.now()) {
      this.destroy(sessionId);
      return null;
    }
    return { userId: session.userId, userName: session.userName };
  }

  destroy(sessionId: string) {
    this.session.delete(sessionId);
  }
}

export default new SessionStore();

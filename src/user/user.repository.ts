import { InternalServerError } from "@/core/http/httpError";
import { dataSource } from "@/core/util/dataSource";
import { User } from "@/user/user.entity";

const UserRepository = dataSource.getRepository(User).extend({
  async findById(id: number) {
    const user = await this.findOne({ where: { id } });
    if (!user) {
      throw new InternalServerError("User not found");
    }
    return user;
  },

  async findByEmail(email: string) {
    const user = await this.findOne({ where: { email } });
    if (!user) {
      throw new InternalServerError("User not found");
    }
    return user;
  },

  async findByNickname(nickname: string) {
    const user = await this.findOne({ where: { nickname } });
    if (!user) {
      throw new InternalServerError("User not found");
    }
    return user;
  },

  async list() {
    return this.find();
  },

  async createUser(userData: Partial<User>) {
    const user = this.create(userData);
    return this.save(user);
  },

  async update(id: number, userData: Partial<User>) {
    return this.update(id, userData);
  },

  async delete(id: number) {
    return this.delete(id);
  },
});

export { UserRepository };

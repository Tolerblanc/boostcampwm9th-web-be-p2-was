import { dataSource } from "@/core/util/dataSource";
import { User } from "./user.entity";

const userRepository = dataSource.getRepository(User).extend({
  async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  },

  async findByNickname(nickname: string) {
    return this.findOne({ where: { nickname } });
  },

  async list() {
    return this.find();
  },

  async create(userData: Partial<User>) {
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

export { userRepository };

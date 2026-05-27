import type { clients } from '@optsolv/db';
import { type ClientFilters, ClientsRepository } from './clients.repository';

export class ClientsService {
  private readonly repository = new ClientsRepository();

  async listClients(filters: ClientFilters = {}) {
    return this.repository.findMany(filters);
  }

  async createClient(data: Omit<typeof clients.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.repository.create({
      ...data,
      active: data.active ?? true,
    });
  }

  async updateClient(id: string, data: Partial<typeof clients.$inferInsert>) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Cliente não encontrado');
    }
    return this.repository.update(id, data);
  }
}

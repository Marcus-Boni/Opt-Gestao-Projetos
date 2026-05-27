import { clients, db } from '@optsolv/db';
import { and, eq, ilike } from 'drizzle-orm';

export type ClientFilters = {
  search?: string | undefined;
  active?: boolean | undefined;
};

export class ClientsRepository {
  async findMany(filters: ClientFilters = {}) {
    const conditions = [];
    if (filters.search) {
      conditions.push(ilike(clients.name, `%${filters.search}%`));
    }
    if (filters.active !== undefined) {
      conditions.push(eq(clients.active, filters.active));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(clients).where(whereClause).orderBy(clients.name);
  }

  async findById(id: string) {
    const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return client ?? null;
  }

  async create(data: typeof clients.$inferInsert) {
    const [newClient] = await db.insert(clients).values(data).returning();
    return newClient;
  }

  async update(id: string, data: Partial<typeof clients.$inferInsert>) {
    const [updated] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }
}

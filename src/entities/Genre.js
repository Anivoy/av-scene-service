import { EntitySchema } from 'typeorm';

export const Genre = new EntitySchema({
  name: 'Genre',
  tableName: 'genres',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar', unique: true },
    description: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    shows: {
      type: 'many-to-many',
      target: 'Show',
      inverseSide: 'genres',
    },
  },
});
  
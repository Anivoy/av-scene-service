import { EntitySchema } from 'typeorm';

export const Difficulty = new EntitySchema({
  name: 'Difficulty',
  tableName: 'difficulties',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar', unique: true },
    description: { type: 'text', nullable: true },
    colorCode: { type: 'varchar', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    shows: {
      type: 'one-to-many',
      target: 'Show',
      inverseSide: 'difficulty',
    },
    scenes: {
      type: 'one-to-many',
      target: 'Scene',
      inverseSide: 'difficulty',
    },
  },
});

import { EntitySchema } from 'typeorm';

export const Show = new EntitySchema({
  name: 'Show',
  tableName: 'shows',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    title: { type: 'varchar', unique: true },
    alternativeTitle: { type: 'varchar', nullable: true },
    synopsis: { type: 'text', nullable: true },
    type: {
      type: 'enum',
      enum: ['Movie', 'Series'],
      nullable: true,
    },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    genres: {
      type: 'many-to-many',
      target: 'Genre',
      joinTable: true,
      cascade: true,
    },
    scenes: {
      type: 'one-to-many',
      target: 'Scene',
      inverseSide: 'show',
    },
    difficulty: {
      type: 'many-to-one',
      target: 'Difficulty',
      joinColumn: true,
      nullable: true,
    },
    season: {
      type: 'many-to-one',
      target: 'Season',
      joinColumn: true,
      nullable: true,
    },
  },
});

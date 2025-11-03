import { EntitySchema } from 'typeorm';

export const Scene = new EntitySchema({
  name: 'Scene',
  tableName: 'scenes',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar' },
    description: { type: 'text', nullable: true },
    geoData: { type: 'geometry', spatialFeatureType: 'Point', srid: 4326 },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    show: {
      type: 'many-to-one',
      target: 'Show',
      joinColumn: true,
      onDelete: 'CASCADE',
    },
    difficulty: {
      type: 'many-to-one',
      target: 'Difficulty',
      joinColumn: true,
      nullable: true,
    },
    images: {
      type: 'one-to-many',
      target: 'SceneImage',
      inverseSide: 'scene',
      cascade: true,
    },
  },
});

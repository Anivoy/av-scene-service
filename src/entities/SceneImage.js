import { EntitySchema } from 'typeorm';

export const SceneImage = new EntitySchema({
  name: 'SceneImage',
  tableName: 'scene_images',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    url: {
      type: 'varchar',
    },
    alt: {
      type: 'varchar',
      nullable: true
    }
  },
  relations: {
    scene: {
      type: 'many-to-one',
      target: 'Scene',
      joinColumn: true,
      onDelete: 'CASCADE',
    },
  },
});

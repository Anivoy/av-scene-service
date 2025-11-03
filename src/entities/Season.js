import { EntitySchema } from 'typeorm';

export const Season = new EntitySchema({
  name: 'Season',
  tableName: 'seasons',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar' },
    year: { type: 'int' },
    quarter: { 
      type: 'enum', 
      enum: ['Winter', 'Spring', 'Summer', 'Fall']
    },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    shows: {
      type: 'one-to-many',
      target: 'Show',
      inverseSide: 'season',
    },
  },
  indices: [
    {
      name: 'IDX_season_year_quarter',
      columns: ['year', 'quarter'],
      unique: true,
    },
  ],
  subscribers: [
  {
    beforeInsert(event) {
      if (!event.entity.name && event.entity.quarter && event.entity.year) {
        event.entity.name = `${event.entity.quarter} ${event.entity.year}`;
      }
    },
    beforeUpdate(event) {
      if (!event.entity.name && event.entity && (event.entity.quarter || event.entity.year)) {
        const quarter = event.entity.quarter || event.databaseEntity.quarter;
        const year = event.entity.year || event.databaseEntity.year;
        event.entity.name = `${quarter} ${year}`;
      }
    }
  }
],
});
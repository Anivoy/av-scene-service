/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddSeasonType1762160341590 {
    name = 'AddSeasonType1762160341590'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."seasons_quarter_enum" AS ENUM('Winter', 'Spring', 'Summer', 'Fall')`);
        await queryRunner.query(`CREATE TABLE "seasons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "year" integer NOT NULL, "quarter" "public"."seasons_quarter_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb8ed53b5fe109dcd4a4449ec9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_season_year_quarter" ON "seasons" ("year", "quarter") `);
        await queryRunner.query(`CREATE TYPE "public"."shows_type_enum" AS ENUM('Movie', 'Series')`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "type" "public"."shows_type_enum"`);
        await queryRunner.query(`ALTER TABLE "shows" ADD "seasonId" uuid`);
        await queryRunner.query(`ALTER TABLE "shows" ADD CONSTRAINT "FK_178cda3494685f967bbd5bb2106" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "shows" DROP CONSTRAINT "FK_178cda3494685f967bbd5bb2106"`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "seasonId"`);
        await queryRunner.query(`ALTER TABLE "shows" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."shows_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_season_year_quarter"`);
        await queryRunner.query(`DROP TABLE "seasons"`);
        await queryRunner.query(`DROP TYPE "public"."seasons_quarter_enum"`);
    }
}

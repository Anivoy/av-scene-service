/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitSchema1762158461534 {
  name = "InitSchema1762158461534";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Create difficulties table
    await queryRunner.query(`
      CREATE TABLE "difficulties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "colorCode" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_difficulties_name" UNIQUE ("name"),
        CONSTRAINT "PK_difficulties" PRIMARY KEY ("id")
      )
    `);

    // Create genres table
    await queryRunner.query(`
      CREATE TABLE "genres" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_genres_name" UNIQUE ("name"),
        CONSTRAINT "PK_genres" PRIMARY KEY ("id")
      )
    `);

    // Create shows table
    await queryRunner.query(`
      CREATE TABLE "shows" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "alternativeTitle" character varying,
        "synopsis" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "difficultyId" uuid,
        CONSTRAINT "UQ_shows_title" UNIQUE ("title"),
        CONSTRAINT "PK_shows" PRIMARY KEY ("id")
      )
    `);

    // Create scenes table with PostGIS geometry
    await queryRunner.query(`
      CREATE TABLE "scenes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "geoData" geometry(Point,4326) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "showId" uuid,
        "difficultyId" uuid,
        CONSTRAINT "PK_scenes" PRIMARY KEY ("id")
      )
    `);

    // Create scene_images table
    await queryRunner.query(`
      CREATE TABLE "scene_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying NOT NULL,
        "alt" character varying,
        "sceneId" uuid,
        CONSTRAINT "PK_scene_images" PRIMARY KEY ("id")
      )
    `);

    // Create join table for shows and genres (many-to-many)
    await queryRunner.query(`
      CREATE TABLE "shows_genres_genres" (
        "showsId" uuid NOT NULL,
        "genresId" uuid NOT NULL,
        CONSTRAINT "PK_shows_genres" PRIMARY KEY ("showsId", "genresId")
      )
    `);

    // Create indexes for join table
    await queryRunner.query(`
      CREATE INDEX "IDX_c100fff0eb0656a3d0c9b889e2" ON "shows_genres_genres" ("showsId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_548ec02873c1fe882428d38a08" ON "shows_genres_genres" ("genresId")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "shows"
      ADD CONSTRAINT "FK_2f932e96460237b88268521eae0"
      FOREIGN KEY ("difficultyId")
      REFERENCES "difficulties"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "scenes"
      ADD CONSTRAINT "FK_0c0668114709371699eac704440"
      FOREIGN KEY ("showId")
      REFERENCES "shows"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "scenes"
      ADD CONSTRAINT "FK_4722c32112afb9946b025431ae3"
      FOREIGN KEY ("difficultyId")
      REFERENCES "difficulties"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "scene_images"
      ADD CONSTRAINT "FK_1d56af933453ab98d704c481c41"
      FOREIGN KEY ("sceneId")
      REFERENCES "scenes"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "shows_genres_genres"
      ADD CONSTRAINT "FK_c100fff0eb0656a3d0c9b889e20"
      FOREIGN KEY ("showsId")
      REFERENCES "shows"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "shows_genres_genres"
      ADD CONSTRAINT "FK_548ec02873c1fe882428d38a086"
      FOREIGN KEY ("genresId")
      REFERENCES "genres"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "shows_genres_genres" DROP CONSTRAINT "FK_548ec02873c1fe882428d38a086"
    `);
    await queryRunner.query(`
      ALTER TABLE "shows_genres_genres" DROP CONSTRAINT "FK_c100fff0eb0656a3d0c9b889e20"
    `);
    await queryRunner.query(`
      ALTER TABLE "scene_images" DROP CONSTRAINT "FK_1d56af933453ab98d704c481c41"
    `);
    await queryRunner.query(`
      ALTER TABLE "scenes" DROP CONSTRAINT "FK_4722c32112afb9946b025431ae3"
    `);
    await queryRunner.query(`
      ALTER TABLE "scenes" DROP CONSTRAINT "FK_0c0668114709371699eac704440"
    `);
    await queryRunner.query(`
      ALTER TABLE "shows" DROP CONSTRAINT "FK_2f932e96460237b88268521eae0"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_548ec02873c1fe882428d38a08"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c100fff0eb0656a3d0c9b889e2"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "shows_genres_genres"`);
    await queryRunner.query(`DROP TABLE "scene_images"`);
    await queryRunner.query(`DROP TABLE "scenes"`);
    await queryRunner.query(`DROP TABLE "shows"`);
    await queryRunner.query(`DROP TABLE "genres"`);
    await queryRunner.query(`DROP TABLE "difficulties"`);
  }
}
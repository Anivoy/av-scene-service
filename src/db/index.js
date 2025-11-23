import { PrismaClient } from '@prisma/client';

const SOFT_DELETE_MODELS = {
  Difficulty: true,
  Genre: true,
  Season: true,
  Show: true,
  Region: true,
  Prefecture: true,
  City: true,
  Scene: true,
};

const prisma = new PrismaClient();
export default prisma;

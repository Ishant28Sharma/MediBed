import { PrismaClient } from '@prisma/client';

console.log('PrismaClient:', PrismaClient);
const prisma = new PrismaClient();
console.log('Instance models:', Object.keys(prisma));
process.exit(0);

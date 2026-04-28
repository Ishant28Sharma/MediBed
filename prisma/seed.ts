import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const ward = await prisma.ward.create({
    data: {
      name: 'Cardiology Unit',
      floor: 4,
      totalBeds: 20
    }
  });

  const statuses = ['available', 'occupied', 'cleaning', 'available', 'occupied', 'occupied', 'available', 'cleaning', 'cleaning', 'available', 'occupied', 'occupied', 'available', 'available', 'occupied', 'available', 'occupied', 'available', 'occupied', 'cleaning'];

  for (let i = 0; i < 20; i++) {
    await prisma.bed.create({
      data: {
        bedNumber: `B-4${(i + 1).toString().padStart(2, '0')}`,
        status: statuses[i],
        wardId: ward.id
      }
    })
  }

  console.log('Seeded database with Cardiology Ward and 20 Beds')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

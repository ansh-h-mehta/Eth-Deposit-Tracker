import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all deposit events from the database
async function getAllDepositEvents() {
  try {
    const events = await prisma.depositEvent.findMany();
    console.log('All deposit events:', events);
    return events;
  } catch (error) {
    console.error('Error fetching deposit events:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function so it can be called from another file
export { getAllDepositEvents };
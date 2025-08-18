import { seedDatabase } from '../utils/seedData';
import '../lib/firebase'; // Initialize Firebase

async function seedSwapOffers() {
  try {
    console.log('🌱 Seeding swap offers...');
    await seedDatabase();
    console.log('✅ Swap offers seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding swap offers:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedSwapOffers();
}

export { seedSwapOffers };

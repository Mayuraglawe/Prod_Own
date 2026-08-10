import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Subscription Plans...');

  await prisma.subscriptionPlan.upsert({
    where: { tierCode: 'starter' },
    update: {},
    create: {
      tierCode: 'starter',
      name: 'Starter Plan',
      price: 9900,
      currency: 'INR',
      isPopular: true,
      features: [
        '100,000 Log Events per month',
        '7 Days Data Retention',
        'Up to 3 Team Members',
        'Community Support'
      ],
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { tierCode: 'pro' },
    update: {},
    create: {
      tierCode: 'pro',
      name: 'Pro Plan',
      price: 49900,
      currency: 'INR',
      isPopular: false,
      features: [
        '500,000 Log Events per month',
        '30 Days Data Retention',
        'Unlimited Team Members',
        'Priority Email Support',
        'Custom Webhooks'
      ],
    },
  });

  console.log('Successfully seeded Subscription Plans!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

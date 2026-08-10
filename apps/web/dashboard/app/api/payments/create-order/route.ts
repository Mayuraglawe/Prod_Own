import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '../../../../auth';
import { prisma } from '@litetrace/db';

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    console.warn('⚠️ Razorpay keys are missing. Running in MOCK mode.');
    return null;
  }
  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, tenantId } = await req.json();

    const dbPlan = await prisma.subscriptionPlan.findUnique({
      where: { tierCode: plan },
    });

    if (!dbPlan || !dbPlan.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive plan selected' }, { status: 400 });
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();

    const options = {
      amount: dbPlan.price, // amount is already in paise from DB (e.g. 9900)
      currency: dbPlan.currency,
      receipt: `rcpt_${tenantId}_${Date.now()}`,
      notes: {
        tenantId,
        plan,
        userId: session.user.id,
      },
    };

    let order;
    if (razorpay) {
      order = await razorpay.orders.create(options);
    } else {
      // MOCK MODE: Return a fake order so the user can test the UI flow without keys
      order = {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        notes: options.notes,
        status: 'created',
      };
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('[Razorpay Create Order Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

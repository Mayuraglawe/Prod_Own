import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '../../../../../auth';

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    
    let order;
    if (orderId.startsWith('order_mock_') || !razorpay) {
      // MOCK MODE
      order = {
        id: orderId,
        amount: 49900, // Just a default mock amount
        currency: 'INR',
        notes: {
          tenantId: 'mock_tenant',
          plan: 'pro',
          userId: session.user.id,
        },
      };
    } else {
      order = await razorpay.orders.fetch(orderId);
    }

    // Ensure that this user is authorized to view this order. 
    // In our create-order, we store userId in notes.
    if (order.notes?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error('[Razorpay Fetch Order Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

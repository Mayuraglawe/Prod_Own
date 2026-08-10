import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // Only process successful payment events
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment?.entity || event.payload.order?.entity;
      
      const { tenantId, userId, plan } = paymentEntity.notes || {};

      if (tenantId) {
        // Save the raw payment event in the database
        await prisma.paymentEvent.create({
          data: {
            tenantId,
            provider: 'razorpay',
            providerEvent: event.event,
            payload: event,
          },
        });

        // Calculate end date (30 days from now)
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        // Explicitly track the Admin and Subscription month
        await prisma.subscription.create({
          data: {
            tenantId,
            userId: userId || null,
            planCode: plan || 'unknown',
            status: 'ACTIVE',
            startDate,
            endDate,
            razorpayOrderId: paymentEntity.id,
          },
        });

        // Update Tenant based on the plan chosen
        const planTier = plan === 'pro' ? 'PRO' : 'STARTER';
        // Adjust credits or event quotas logic based on plan here
        // For example, setting custom quota or simple plan Tier update
        
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { 
            planTier,
            ...(plan === 'pro' ? { customEventQuota: 1000000, customRetentionDays: 30 } : { customEventQuota: 100000, customRetentionDays: 7 })
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('[Razorpay Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

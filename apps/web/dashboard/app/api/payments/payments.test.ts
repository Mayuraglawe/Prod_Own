import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// Setup Hoisted Mocks
const {
  mockAuth,
  mockSubscriptionPlanFindUnique,
  mockPaymentEventCreate,
  mockSubscriptionCreate,
  mockTenantUpdate,
  mockOrdersCreate,
} = vi.hoisted(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = 'test_secret';
  return {
    mockAuth: vi.fn(),
    mockSubscriptionPlanFindUnique: vi.fn(),
    mockPaymentEventCreate: vi.fn(),
    mockSubscriptionCreate: vi.fn(),
    mockTenantUpdate: vi.fn(),
    mockOrdersCreate: vi.fn(),
  };
});

vi.mock('../../../auth', () => ({
  auth: mockAuth,
}));

vi.mock('@litetrace/db', () => ({
  prisma: {
    subscriptionPlan: {
      findUnique: () => mockSubscriptionPlanFindUnique(),
    },
    paymentEvent: {
      create: (args: any) => mockPaymentEventCreate(args),
    },
    subscription: {
      create: (args: any) => mockSubscriptionCreate(args),
    },
    tenant: {
      update: (args: any) => mockTenantUpdate(args),
    },
  },
}));

vi.mock('razorpay', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      orders: {
        create: mockOrdersCreate,
      },
    })),
  };
});

// Import the route handlers
import { POST as handleCreateOrder } from './create-order/route';
import { POST as handleWebhook } from './webhook/route';

describe('Payments API Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = '';
    process.env.RAZORPAY_KEY_SECRET = '';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_secret';
  });

  describe('create-order route', () => {
    it('returns 401 if user session is invalid', async () => {
      mockAuth.mockResolvedValue(null); // No session

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'pro', tenantId: 't1' }),
      });

      const res = await handleCreateOrder(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 400 if selected plan is invalid or inactive', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'usr-123' } });
      mockSubscriptionPlanFindUnique.mockResolvedValue(null); // Plan not found

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'premium', tenantId: 't1' }),
      });

      const res = await handleCreateOrder(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Invalid or inactive plan selected');
    });

    it('returns a mock order in mock mode when Razorpay keys are missing', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'usr-123' } });
      mockSubscriptionPlanFindUnique.mockResolvedValue({
        tierCode: 'pro',
        price: 9900,
        currency: 'INR',
        isActive: true,
      });

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'pro', tenantId: 't-test' }),
      });

      const res = await handleCreateOrder(req);
      expect(res.status).toBe(200);
      const order = await res.json();
      expect(order.id).toContain('order_mock_');
      expect(order.amount).toBe(9900);
      expect(order.notes.tenantId).toBe('t-test');
    });

    it('creates a real Razorpay order when keys are present', async () => {
      process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
      process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';

      mockAuth.mockResolvedValue({ user: { id: 'usr-123' } });
      mockSubscriptionPlanFindUnique.mockResolvedValue({
        tierCode: 'pro',
        price: 9900,
        currency: 'INR',
        isActive: true,
      });
      mockOrdersCreate.mockResolvedValue({
        id: 'order_real_123',
        amount: 9900,
        status: 'created',
      });

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'pro', tenantId: 't-real' }),
      });

      const res = await handleCreateOrder(req);
      expect(res.status).toBe(200);
      const order = await res.json();
      expect(order.id).toBe('order_real_123');
      expect(mockOrdersCreate).toHaveBeenCalled();
    });
  });

  describe('webhook route', () => {
    it('returns 400 if Razorpay signature header is missing', async () => {
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        body: JSON.stringify({ event: 'order.paid' }),
      });

      const res = await handleWebhook(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Missing signature');
    });

    it('returns 400 if webhook signature is invalid', async () => {
      const body = JSON.stringify({ event: 'order.paid' });
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'x-razorpay-signature': 'invalid_signature',
        },
        body,
      });

      const res = await handleWebhook(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Invalid signature');
    });

    it('processes order.paid webhook, updates DB, and updates Tenant plan Tier', async () => {
      const webhookPayload = {
        event: 'order.paid',
        payload: {
          order: {
            entity: {
              id: 'order_abc123',
              notes: {
                tenantId: 'tenant-999',
                userId: 'usr-888',
                plan: 'pro',
              },
            },
          },
        },
      };

      const bodyText = JSON.stringify(webhookPayload);
      const signature = crypto
        .createHmac('sha256', 'test_secret')
        .update(bodyText)
        .digest('hex');

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'x-razorpay-signature': signature,
        },
        body: bodyText,
      });

      const res = await handleWebhook(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');

      // Verify DB updates
      expect(mockPaymentEventCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-999',
            provider: 'razorpay',
            providerEvent: 'order.paid',
          }),
        })
      );

      expect(mockSubscriptionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-999',
            userId: 'usr-888',
            planCode: 'pro',
            status: 'ACTIVE',
            razorpayOrderId: 'order_abc123',
          }),
        })
      );

      expect(mockTenantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tenant-999' },
          data: expect.objectContaining({
            planTier: 'PRO',
            customEventQuota: 1000000,
            customRetentionDays: 30,
          }),
        })
      );
    });
  });
});

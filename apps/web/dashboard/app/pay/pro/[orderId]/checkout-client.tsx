'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

interface OrderData {
  id: string;
  amount: number;
  currency: string;
  notes?: {
    plan?: string;
  };
}

export function PaymentCheckoutClient({
  orderId,
  user,
}: {
  orderId: string;
  user: { name?: string | null; email?: string | null };
}) {
  const router = useRouter();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async (id: string) => {
      try {
        const res = await fetch(`/api/payments/order/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await res.json();
        setOrderData(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const handlePay = () => {
    if (!orderData) return;
    
    setIsProcessing(true);
    
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKey',
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'LiteTrace',
      description: `Upgrade to ${orderData.notes?.plan === 'pro' ? 'Pro' : 'Starter'} Plan`,
      order_id: orderData.id,
      handler: function () {
        // Payment successful callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push(`/pay/success/${orderData.id}` as any);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#3B82F6',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RazorpayConstructor = (window as any).Razorpay;
    const rzp = new RazorpayConstructor(options);
    
    rzp.on('payment.failed', function (response: RazorpayError) {
      console.error(response.error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    });
    
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F5F4] flex items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-[#3B82F6] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F5F4] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8E4] shadow-sm p-8 space-y-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-[#13221C]">Error Loading Order</h1>
          <p className="text-[#687870]">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/payments')}
            className="px-6 py-2.5 bg-slate-100 text-[#13221C] font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Return to Billing
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-[#F3F5F4] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8E4] shadow-xl p-8 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#02042B] to-[#1E3A8A] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-[#3B82F6]" />
            </div>
            <h1 className="text-2xl font-black text-[#13221C]">Complete Your Upgrade</h1>
            <p className="text-sm text-[#687870]">
              You are upgrading to the <strong className="text-[#13221C] capitalize">{orderData.notes?.plan}</strong> Plan.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-[#E2E8E4] space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#687870] font-medium">Order ID</span>
              <span className="text-[#13221C] font-mono font-bold truncate max-w-[150px]">{orderData.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#687870] font-medium">Plan Tier</span>
              <span className="text-[#13221C] font-bold capitalize">{orderData.notes?.plan}</span>
            </div>
            <div className="pt-4 border-t border-[#E2E8E4] flex justify-between items-center">
              <span className="text-[#13221C] font-bold">Total Amount</span>
              <span className="text-2xl font-black text-[#1E3A8A]">
                ₹{(orderData.amount / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#687870] justify-center font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
              Secure 128-bit SSL Encrypted Payment
            </div>
            
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-4 bg-[#02042B] text-white font-bold text-lg rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isProcessing ? 'Waiting for completion...' : 'Proceed to Pay'}
            </button>
            
            <button
              onClick={() => router.back()}
              disabled={isProcessing}
              className="w-full py-2.5 text-[#687870] font-bold text-sm hover:text-[#13221C] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

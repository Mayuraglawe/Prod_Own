'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setOrderId(p.orderId);
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-[#F3F5F4] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8E4] shadow-xl p-10 text-center space-y-6">
        
        <div className="w-20 h-20 bg-[#E6F7F0] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#20C997]" />
        </div>
        
        <h1 className="text-3xl font-black text-[#13221C]">Payment Successful!</h1>
        
        <p className="text-[#687870] leading-relaxed">
          Thank you for your purchase. Your payment for order <span className="font-mono text-[#13221C] font-bold">{orderId}</span> has been processed successfully. Your workspace plan will be updated momentarily.
        </p>

        <div className="pt-6 border-t border-[#E2E8E4]">
          <Link href="/dashboard/payments" className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#02042B] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
      </div>
    </div>
  );
}

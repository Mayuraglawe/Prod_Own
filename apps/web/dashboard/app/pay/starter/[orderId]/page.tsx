import { auth } from '../../../../auth';
import { PaymentCheckoutClient } from './checkout-client';

export default async function DedicatedPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  const { orderId } = await params;

  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
  };

  return <PaymentCheckoutClient orderId={orderId} user={user} />;
}

/**
 * Direct PSE bank transfer payment — server-side example.
 *
 * Usage:
 *   BLOQUE_RUN_PSE_EXAMPLE=1 BLOQUE_SECRET_KEY=sk_test_... BLOQUE_PAYMENT_URN=did:bloque:payments:... npx tsx examples/direct-pse-payment.example.ts
 */
import { Bloque } from '../packages/payments/src';

if (!process.env.BLOQUE_RUN_PSE_EXAMPLE) {
  console.log('Skipped — set BLOQUE_RUN_PSE_EXAMPLE=1 to run.');
  process.exit(0);
}

const secretKey = process.env.BLOQUE_SECRET_KEY!;
const paymentUrn = process.env.BLOQUE_PAYMENT_URN!;

if (!secretKey || !paymentUrn) {
  console.error('BLOQUE_SECRET_KEY and BLOQUE_PAYMENT_URN are required.');
  process.exit(1);
}

async function main() {
  const bloque = new Bloque({
    mode: 'sandbox',
    secretKey,
  });

  console.log('Creating PSE payment…');

  const payment = await bloque.payments.create({
    paymentUrn,
    payment: {
      type: 'pse',
      data: {
        email: 'user@example.com',
        personType: 'natural',
        documentType: 'CC',
        documentNumber: '1234567890',
        bankCode: '1007',
      },
    },
  });

  console.log('Payment created:', payment.id, '— status:', payment.status);

  if (payment.checkout_url) {
    console.log('Redirect user to complete PSE payment:', payment.checkout_url);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

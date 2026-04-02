/**
 * Direct cash payment — server-side example.
 *
 * Usage:
 *   BLOQUE_RUN_CASH_EXAMPLE=1 BLOQUE_SECRET_KEY=sk_test_... BLOQUE_PAYMENT_URN=did:bloque:payments:... npx tsx examples/direct-cash-payment.example.ts
 */
import { Bloque } from '../packages/payments/src';

if (!process.env.BLOQUE_RUN_CASH_EXAMPLE) {
  console.log(
    'Skipped — set BLOQUE_RUN_CASH_EXAMPLE=1 to run.',
  );
  process.exit(0);
}

const secretKey = process.env.BLOQUE_SECRET_KEY;
const paymentUrn = process.env.BLOQUE_PAYMENT_URN;

if (!secretKey || !paymentUrn) {
  console.error('BLOQUE_SECRET_KEY and BLOQUE_PAYMENT_URN are required.');
  process.exit(1);
}

async function main() {
  const bloque = new Bloque({
    mode: 'sandbox',
    secretKey,
  });

  console.log('Creating cash payment…');

  const payment = await bloque.payments.create({
    paymentUrn,
    payment: {
      type: 'cash',
      data: {
        fullName: 'Carlos Martínez',
        email: 'carlos@example.com',
        documentType: 'CC',
        documentNumber: '1122334455',
      },
    },
  });

  console.log('Payment created:', payment.id, '— status:', payment.status);

  if (payment.payment_code) {
    console.log('Cash payment code (present at authorized locations):', payment.payment_code);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

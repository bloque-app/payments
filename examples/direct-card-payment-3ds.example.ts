/**
 * Direct card payment with 3D Secure — server-side example.
 *
 * Usage:
 *   BLOQUE_RUN_CARD_EXAMPLE=1 BLOQUE_ACCESS_TOKEN=<token> BLOQUE_CHECKOUT_ID=<id> npx tsx examples/direct-card-payment-3ds.example.ts
 *
 * IMPORTANT: browser_info values below are mocked. In a real integration the
 * browser_info MUST be collected from the user's browser (window.screen,
 * navigator.language, etc.) and sent to the server.
 */
import { Bloque } from '../packages/payments/src';

if (!process.env.BLOQUE_RUN_CARD_EXAMPLE) {
  console.log(
    'Skipped — set BLOQUE_RUN_CARD_EXAMPLE=1 to run (avoids accidental charges).',
  );
  process.exit(0);
}

const accessToken = process.env.BLOQUE_ACCESS_TOKEN;
const checkoutId = process.env.BLOQUE_CHECKOUT_ID;

if (!accessToken || !checkoutId) {
  console.error(
    'BLOQUE_ACCESS_TOKEN and BLOQUE_CHECKOUT_ID are required.',
  );
  process.exit(1);
}

async function main() {
  const bloque = new Bloque({
    mode: 'sandbox',
    accessToken,
  });

  console.log('Creating 3DS card payment…');

  const payment = await bloque.payments.create({
    checkoutId,
    payment: {
      type: 'card',
      data: {
        cardNumber: '4111111111111111',
        cardholderName: 'Test User',
        expiryMonth: '12',
        expiryYear: '2028',
        cvv: '123',
        email: 'test@example.com',
        is_three_ds: true,
        three_ds_auth_type: process.env.BLOQUE_THREE_DS_AUTH_TYPE ?? 'challenge_v2',
        browser_info: {
          browser_color_depth: '24',
          browser_screen_height: '1080',
          browser_screen_width: '1920',
          browser_language: 'es',
          browser_user_agent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          browser_tz: '-300',
        },
      },
    },
  });

  console.log('Payment created:', payment.id, '— status:', payment.status);

  if (payment.three_ds?.iframe) {
    console.log('3DS iframe received — render this in the browser:');
    console.log(payment.three_ds.iframe.slice(0, 200), '…');
  }

  // Poll for terminal status
  const MAX_ATTEMPTS = 60;
  const INTERVAL_MS = 3_000;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, INTERVAL_MS));

    const status = await bloque.payments.getStatus(payment.id);
    console.log(`[${i + 1}/${MAX_ATTEMPTS}] status: ${status.status}`);

    if (status.status === 'completed' || status.status === 'failed') {
      console.log('Terminal status reached:', JSON.stringify(status, null, 2));
      return;
    }
  }

  console.log('Timeout — payment still pending after polling.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

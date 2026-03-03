import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Bloque } from '../../../../packages/payments/src';

const accessToken = process.env.BLOQUE_ACCESS_TOKEN;
const mode =
  process.env.BLOQUE_MODE === 'production' ? 'production' : 'sandbox';
const port = Number(process.env.PORT ?? 8787);

if (!accessToken) {
  throw new Error('Missing BLOQUE_ACCESS_TOKEN. Check api/.env.example');
}

const bloque = new Bloque({
  accessToken,
  mode,
});

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

app.get('/health', (c) => c.json({ ok: true, mode }));

app.post('/api/payment-intents', async (c) => {
  try {
    const checkout = await bloque.checkout.create({
      name: 'Carrito de ejemplo de 3 USD',
      description: '3 items de 1 USD cada uno',
      asset: 'DUSD/6',
      image_url:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop',
      items: [
        {
          name: 'Item 1 USD - #1',
          description: 'Primer item de un dolar',
          amount: 1_000000,
          quantity: 1,
        },
        {
          name: 'Item 1 USD - #2',
          description: 'Segundo item de un dolar',
          amount: 1_000000,
          quantity: 1,
        },
        {
          name: 'Item 1 USD - #3',
          description: 'Tercer item de un dolar',
          amount: 1_000000,
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        source: 'hono-react-example',
      },
    });
    console.log('Created checkout:', checkout);

    return c.json({
      checkoutId: checkout.id,
      amountTotal: checkout.amount_total,
      asset: checkout.asset,
      status: checkout.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return c.json({ error: 'Failed to create payment intent' }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Hono API running at http://localhost:${info.port}`);
  },
);

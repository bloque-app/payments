import { Bloque } from '../packages/payments/src';

async function main() {
  const bloque = new Bloque({
    mode: 'sandbox',
    secretKey: 'sk_test_REPLACE_ME',
  });

  const checkout = await bloque.checkout.create({
    name: 'Plan Profesional Mensual',
    description: 'Acceso completo a todas las herramientas premium',
    asset: 'USD/6',
    payment_type: 'subscription',
    items: [
      {
        name: 'Suscripción mensual',
        amount: 29_000000,
        quantity: 1,
      },
    ],
    subscription: {
      type: 'cron',
      cron: '0 0 1 * *',
      status: 'active',
    },
    success_url: 'https://bloque.app/success',
    cancel_url: 'https://bloque.app/cancel',
    redirect_url: 'https://bloque.app/dashboard',
  });

  console.log('Subscription checkout URL:', checkout.url);
  console.log('Payment type:', checkout.payment_type);
}

main();

import { Bloque } from '../packages/payments-sdk/src';

async function main() {
  const bloque = new Bloque({
    mode: 'sandbox',
    apiKey: 'your-api-key-here',
  });

  const checkout = await bloque.checkout.create({
    name: 'Pack Profesional de Productividad',
    description:
      'Periféricos premium para trabajo intensivo y alto rendimiento',
    currency: 'COP',
    image_url: 'https://cdn.bloque.app/checkouts/productivity-pack.png',
    items: [
      {
        name: 'Teclado mecánico Keychron K2',
        description: 'Wireless, RGB, switches Blue',
        amount: 450_000,
        quantity: 2,
        image_url: 'https://cdn.bloque.app/items/keychron-k2.png',
      },
      {
        name: 'Mouse Logitech MX Master 3S',
        description: 'Inalámbrico, sensor 8K DPI',
        amount: 380_000,
        quantity: 1,
        image_url: 'https://cdn.bloque.app/items/mx-master-3s.png',
      },
    ],
    success_url: 'https://bloque.app/success',
    cancel_url: 'https://bloque.app/cancel',
  });

  console.log('Checkout URL:', checkout.url);
}

main();

/** biome-ignore-all lint/a11y/noSvgWithoutTitle: decorative icons */
/** biome-ignore-all lint/a11y/useValidAnchor: demo links */
import './App.css';

import { useMemo, useState } from 'react';
import { BloqueCheckout } from '../../../../packages/payments-react/src/index';

type PaymentIntentResponse = {
  checkoutId: string;
  amountTotal: number;
  asset: string;
  status: string;
};

const API_BASE_URL = 'http://localhost:8787';
const PUBLIC_API_KEY = 'pk_dsdfsddddddddddddddddddffffffffer3resfsef';

const product = {
  name: 'Pack de Donacion',
  description:
    'Checkout de ejemplo creado desde Hono. El backend arma un carrito de 3 items de 1 USD cada uno.',
  price: 3,
  currency: 'USD' as const,
  image:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
  rating: 5,
  reviews: 128,
};

const App = () => {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [asset, setAsset] = useState<string | null>(null);
  const [amountTotal, setAmountTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalLabel = useMemo(() => {
    if (amountTotal === null || asset !== 'DUSD/6') {
      return '$3.00';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountTotal / 1_000000);
  }, [amountTotal, asset]);

  const createIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? 'Could not create payment intent');
      }

      const payload = (await response.json()) as PaymentIntentResponse;
      setCheckoutId(payload.checkoutId);
      setAsset(payload.asset);
      setAmountTotal(payload.amountTotal);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unexpected error creating payment intent';
      setError(message);
      setCheckoutId(null);
      setAsset(null);
      setAmountTotal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6366f1" />
              <path
                d="M8 16L14 22L24 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Bloque Pay</span>
          </div>
          <nav className="nav">
            <a href="#" className="nav-link">
              Inicio
            </a>
            <a href="#" className="nav-link">
              Productos
            </a>
            <a href="#" className="nav-link">
              Contacto
            </a>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="checkout-page">
          <div className="product-section">
            <div className="product-image-container">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            </div>

            <div className="product-details">
              <h1 className="product-name">{product.name}</h1>

              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="rating-text">{product.rating}</span>
                <span className="reviews-text">
                  ({product.reviews.toLocaleString()} reseñas)
                </span>
              </div>

              <p className="product-description">{product.description}</p>

              <div className="product-price">
                <span className="current-price">$3.00</span>
              </div>

              <div className="product-features">
                <div className="feature">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Asset DUSD/6</span>
                </div>
                <div className="feature">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>3 items x 1 USD</span>
                </div>
                <div className="feature">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pago seguro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-section">
            <div className="payment-card">
              <div className="payment-header">
                <h2>Resumen del pedido</h2>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Item 1</span>
                  <span>$1.00</span>
                </div>
                <div className="summary-row">
                  <span>Item 2</span>
                  <span>$1.00</span>
                </div>
                <div className="summary-row">
                  <span>Item 3</span>
                  <span>$1.00</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{totalLabel}</span>
                </div>
                <div className="summary-row">
                  <span>Asset</span>
                  <span>{asset ?? 'DUSD/6'}</span>
                </div>
              </div>

              {!checkoutId ? (
                <button
                  type="button"
                  className="create-intent-btn"
                  onClick={createIntent}
                  disabled={loading}
                >
                  {loading ? 'Creando checkout...' : 'Crear checkout'}
                </button>
              ) : null}

              {error ? <p className="checkout-error">Error: {error}</p> : null}

              {checkoutId ? (
                <div className="checkout-form">
                  <BloqueCheckout
                    checkoutId={checkoutId}
                    publicApiKey={PUBLIC_API_KEY}
                    mode="production"
                    paymentMethods={['card']}
                    onSuccess={(response) => {
                      console.log('Payment successful!', response);
                      alert(
                        `Pago ${response.status} - id ${response.payment_id}`,
                      );
                    }}
                    onError={(checkoutError) => {
                      console.error('Payment failed:', checkoutError);
                      alert(`Error en el pago: ${checkoutError}`);
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Bloque Pay. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;

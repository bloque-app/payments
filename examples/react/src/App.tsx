/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
import './App.css';

import {
  type AppearanceConfig,
  BloqueCheckout,
  type CheckoutConfig,
  init,
} from '../../../packages/payments-react/src/index';

init({
  publicApiKey:
    'pk_test_51NCIz2Fq3Y6V1gX3r1Y2x5ZK0j3h4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6',
  mode: 'sandbox',
});

const product = {
  name: 'Regálame un Café',
  description:
    'Apoya mi trabajo con un café. Tu contribución me ayuda a seguir creando contenido de calidad y mejorando este proyecto.',
  price: 5.0,
  currency: 'USD' as const,
  image:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
  rating: 5.0,
  reviews: 128,
};

const App = () => {
  const config: CheckoutConfig = {
    amount: product.price,
  };

  const appearance: AppearanceConfig = {
    primaryColor: '#6366f1',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency,
    }).format(price);
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
              Proyectos
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
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
                <span className="current-price">
                  {formatPrice(product.price)}
                </span>
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
                  <span>Pago seguro</span>
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
                  <span>Procesamiento instantáneo</span>
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
                  <span>Soporte incluido</span>
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
                  <span>Donación</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="summary-row">
                  <span>Comisión de procesamiento</span>
                  <span className="free">$0.00</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </div>

              <div className="checkout-form">
                <BloqueCheckout
                  config={config}
                  appearance={appearance}
                  onSuccess={(response) => {
                    console.log('Payment successful!');
                    console.log('Payment ID:', response.payment_id);
                    console.log('Status:', response.status);
                  }}
                  onError={(error) => {
                    console.error('Payment failed:', error.message);
                    alert(`Error en el pago: ${error.message}`);
                  }}
                />
              </div>
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

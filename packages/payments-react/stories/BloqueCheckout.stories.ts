import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { BloqueCheckout } from '../src/bloque-checkout';

const meta = {
  title: 'Components/BloqueCheckout',
  component: BloqueCheckout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checkoutId: { control: 'text' },
    clientSecret: { control: 'text' },
    publishableKey: { control: 'text' },
    mode: {
      control: 'radio',
      options: ['production', 'sandbox'],
    },
    checkoutUrl: { control: 'text' },
    showInstallments: { control: 'boolean' },
    paymentMethods: {
      control: 'check',
      options: ['card', 'pse', 'cash'],
    },
    threeDsAuthType: { control: 'text' },
    className: { control: 'text' },
  },
  args: {
    checkoutId: 'checkout_demo_123',
    onReady: fn(),
    onSuccess: fn(),
    onError: fn(),
    onPending: fn(),
    onThreeDSChallenge: fn(),
  },
} satisfies Meta<typeof BloqueCheckout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAllPaymentMethods: Story = {
  args: {
    paymentMethods: ['card', 'pse', 'cash'],
  },
};

export const CardOnly: Story = {
  args: {
    paymentMethods: ['card'],
  },
};

export const PSEOnly: Story = {
  args: {
    paymentMethods: ['pse'],
  },
};

export const WithInstallments: Story = {
  args: {
    showInstallments: true,
  },
};

export const CustomAppearance: Story = {
  args: {
    appearance: {
      primaryColor: '#64d66aff',
      borderRadius: '18px',
      fontFamily: 'system-ui, sans-serif',
    },
  },
};

export const SandboxMode: Story = {
  args: {
    mode: 'sandbox',
    publishableKey: 'pk_test_demo_key',
  },
};

export const WithClientSecret: Story = {
  args: {
    clientSecret: 'cs_demo_jwt_token',
  },
};

export const CustomIframeStyles: Story = {
  args: {
    iframeStyles: {
      width: '100%',
      minHeight: '500px',
      border: 'none',
      borderRadius: '12px',
    },
  },
};

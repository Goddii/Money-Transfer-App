import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from './Home';
import authReducer from '../../store/authSlice';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('../../utils/api', () => ({
  default: { get: (...args) => mockGet(...args) },
}));

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { isAuthenticated: true, user: { id: 1, first_name: 'Jane' }, token: 't' },
    },
  });
}

const analytics = {
  current_balance: 5000,
  total_received: 1000,
  total_sent: 500,
  total_deposits: 200,
  total_transfers: 3,
  transaction_count: 10,
  monthly_trend: [],
};

beforeEach(() => mockGet.mockReset());

describe('Home wallet analytics', () => {
  it('renders real backend analytics values', async () => {
    mockGet.mockImplementation((url) => {
      if (url === '/wallet/analytics') {
        return Promise.resolve({ data: { data: { analytics } } });
      }
      if (url === '/transactions') {
        return Promise.resolve({ data: { data: { transactions: [] } } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    // Balance appears in the wallet card (current balance) and the analytics grid.
    expect((await screen.findAllByText('KES 5,000.00')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Total Received')).toBeInTheDocument();
    expect(screen.getByText('KES 1,000.00')).toBeInTheDocument();
    // Transaction count stat. `getAllByText` guards against other "10" nodes.
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  it('shows a visible error when the analytics request fails', async () => {
    mockGet.mockImplementation((url) => {
      if (url === '/wallet/analytics') {
        return Promise.reject(new Error('network down'));
      }
      return Promise.resolve({ data: { data: { transactions: [] } } });
    });

    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(
      await screen.findByText(/Unable to load your wallet analytics/i)
    ).toBeInTheDocument();
  });
});

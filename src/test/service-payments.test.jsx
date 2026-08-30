import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// ── Mocks ──────────────────────────────────────────────────────────────────
// The api module is mocked so no real network calls are made. CRITICAL: the
// mocks below must reflect the ACTUAL backend contract
// (verified against app/routes/service_payment_routes.py and the service layer):
//   * single payment  -> res.data.data.payment
//   * list            -> res.data.data.payments + res.data.data.pagination.has_next
//   * detail          -> res.data.data.payment
//   * statuses are Title-case: "Completed" | "Pending" | "Failed" | "Refunded"
//                          | "Initiated" | "Processing"
//   * service metadata is nested under result_metadata
//   * airtime confirmation key is confirmation_reference
vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '../utils/api'

// ── Helpers ────────────────────────────────────────────────────────────────
function makeStore() {
  return configureStore({
    reducer: {
      auth: () => ({
        user: { first_name: 'Test', email: 'test@test.com' },
        token: 'fake-jwt',
        isAuthenticated: true,
      }),
    },
  })
}

function renderWithProviders(ui, { initialEntries = ['/'] } = {}) {
  const store = makeStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

// A realistic single-payment API envelope (matches data.payment).
function paymentEnvelope(payment) {
  return { data: { data: { payment } } }
}
// A realistic list envelope (matches data.payments + data.pagination).
function listEnvelope(payments, hasNext = false) {
  return {
    data: {
      data: {
        payments,
        pagination: { page: 1, per_page: 20, total: payments.length, pages: 1, has_next: hasNext, has_prev: false },
      },
    },
  }
}

// ── Services Page ──────────────────────────────────────────────────────────
describe('Services Page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and displays available services', async () => {
    const { default: Services } = await import('../pages/Services/Services')
    api.get.mockResolvedValue({
      data: {
        data: {
          services: [
            { id: 1, service_type: 'ELECTRICITY', display_name: 'Electricity', name: 'Electricity' },
            { id: 2, service_type: 'WATER', display_name: 'Water', name: 'Water' },
            { id: 3, service_type: 'AIRTIME', display_name: 'Airtime', name: 'Airtime' },
          ],
        },
      },
    })

    renderWithProviders(<Services />, { initialEntries: ['/services'] })

    expect(screen.getByText('Loading services…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Electricity')).toBeInTheDocument()
    })
    expect(screen.getByText('Water')).toBeInTheDocument()
    expect(screen.getByText('Airtime')).toBeInTheDocument()
    expect(screen.getByText('View Payment History →')).toBeInTheDocument()
  })

  it('shows error state on API failure', async () => {
    const { default: Services } = await import('../pages/Services/Services')
    api.get.mockRejectedValue({ response: { data: { message: 'Server error' } } })

    renderWithProviders(<Services />, { initialEntries: ['/services'] })

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('shows empty state when no services available', async () => {
    const { default: Services } = await import('../pages/Services/Services')
    api.get.mockResolvedValue({ data: { data: { services: [] } } })

    renderWithProviders(<Services />, { initialEntries: ['/services'] })

    await waitFor(() => {
      expect(screen.getByText('No services available right now.')).toBeInTheDocument()
    })
  })
})

// ── ServicePayment Form ────────────────────────────────────────────────────
describe('ServicePayment Form', () => {
  beforeEach(() => vi.clearAllMocks())

  const mockService = { id: 1, service_type: 'ELECTRICITY', display_name: 'Electricity', name: 'Electricity' }
  const mockWallet = { balance: 5000, currency: 'KES' }

  function walletMock() {
    return (url) => {
      if (url === '/wallet') return Promise.resolve({ data: { data: { wallet: mockWallet } } })
      return Promise.resolve({ data: { data: { services: [] } } })
    }
  }

  it('renders form fields for electricity', async () => {
    api.get.mockImplementation(walletMock())
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Amount (KES)')).toBeInTheDocument()
    expect(screen.getByText('Review Payment')).toBeInTheDocument()
  })

  it('renders phone field for airtime', async () => {
    api.get.mockImplementation(walletMock())
    const airtimeService = { id: 3, service_type: 'AIRTIME', display_name: 'Airtime', name: 'Airtime' }
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: airtimeService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Phone number')).toBeInTheDocument()
    })
  })

  it('accepts a 254-prefixed airtime number the backend supports', async () => {
    api.get.mockImplementation(walletMock())
    const airtimeService = { id: 3, service_type: 'AIRTIME', display_name: 'Airtime', name: 'Airtime' }
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: airtimeService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Phone number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Phone number'), '254712345678')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    await waitFor(() => {
      expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument()
    })
  })

  it('accepts 0.29 (valid 2-decimal amount, previously a float bug)', async () => {
    api.get.mockImplementation(walletMock())
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    // Decimals cannot be typed reliably into a controlled number input via
    // userEvent; set the value directly to exercise the 2-decimal rule.
    fireEvent.change(screen.getByLabelText('Amount (KES)'), { target: { value: '0.29' } })
    await user.click(screen.getByText('Review Payment'))

    await waitFor(() => {
      expect(screen.getByText('Pay KES 0.29')).toBeInTheDocument()
    })
  })

  it('rejects an amount with more than 2 decimal places', async () => {
    api.get.mockImplementation(walletMock())
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    fireEvent.change(screen.getByLabelText('Amount (KES)'), { target: { value: '0.299' } })
    await user.click(screen.getByText('Review Payment'))

    expect(screen.getByText('Amount cannot have more than 2 decimal places.')).toBeInTheDocument()
  })

  it('validates empty fields', async () => {
    api.get.mockImplementation(walletMock())
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.click(screen.getByText('Review Payment'))

    expect(screen.getByText('Meter number is required.')).toBeInTheDocument()
  })

  it('validates insufficient balance', async () => {
    const lowWallet = { balance: 100, currency: 'KES' }
    api.get.mockImplementation((url) => {
      if (url === '/wallet') return Promise.resolve({ data: { data: { wallet: lowWallet } } })
      return Promise.resolve({ data: { data: { services: [] } } })
    })
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    expect(screen.getByText('Insufficient wallet balance for this payment.')).toBeInTheDocument()
  })

  it('validates invalid meter number format', async () => {
    api.get.mockImplementation(walletMock())
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), 'abc')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    expect(screen.getByText('Meter number must be 10-15 digits.')).toBeInTheDocument()
  })

  it('redirects to services if no service passed', async () => {
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: ['/service-payment'] })

    await waitFor(() => {
      expect(screen.queryByText('Review Payment')).not.toBeInTheDocument()
    })
  })
})

// ── ServicePayment Review Step ─────────────────────────────────────────────
describe('ServicePayment Review', () => {
  beforeEach(() => vi.clearAllMocks())

  const mockService = { id: 1, service_type: 'ELECTRICITY', display_name: 'Electricity', name: 'Electricity' }
  const mockWallet = { balance: 5000, currency: 'KES' }

  it('shows review step with masked account and amount', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/wallet') return Promise.resolve({ data: { data: { wallet: mockWallet } } })
      return Promise.resolve({ data: { data: { services: [] } } })
    })

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    await waitFor(() => {
      expect(screen.getByText('Review Payment')).toBeInTheDocument()
      expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument()
      expect(screen.getByText('****7890')).toBeInTheDocument()
    })
  })
})

// ── ServicePayment Submission ──────────────────────────────────────────────
describe('ServicePayment Submission', () => {
  beforeEach(() => vi.clearAllMocks())

  const mockService = { id: 1, service_type: 'ELECTRICITY', display_name: 'Electricity', name: 'Electricity' }
  const mockWallet = { balance: 5000, currency: 'KES' }

  function walletMock() {
    return (url) => {
      if (url === '/wallet') return Promise.resolve({ data: { data: { wallet: mockWallet } } })
      return Promise.resolve({ data: { data: { services: [] } } })
    }
  }

  it('submits payment and shows success result (reads data.payment)', async () => {
    api.get.mockImplementation(walletMock())
    api.post.mockResolvedValue(paymentEnvelope({
      id: 'pay-123',
      status: 'Completed',
      amount: '500.00',
      payment_reference: 'VYL-SVC-001',
      result_metadata: { token: 'TEST-ELEC-TOKEN-0001', units: 6.8, payment_reference: 'VYL-SVC-001' },
      account_number: '****7890',
      service_type: 'ELECTRICITY',
      created_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    await waitFor(() => {
      expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Pay KES 500.00'))

    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
      expect(screen.getByText('TEST-ELEC-TOKEN-0001')).toBeInTheDocument()
      expect(screen.getByText('6.8 kWh')).toBeInTheDocument()
    })

    // Verify the request shape (idempotency key always present).
    expect(api.post).toHaveBeenCalledWith('/service-payments', expect.objectContaining({
      service_type: 'ELECTRICITY',
      account_number: '1234567890',
      amount: 500,
      idempotency_key: expect.any(String),
    }))
  })

  it('shows refunded state for a failed-then-refunded payment', async () => {
    api.get.mockImplementation(walletMock())
    // Real backend returns "Refunded" (auto-refunded) for the 3333… scenario.
    api.post.mockResolvedValue(paymentEnvelope({
      id: 'pay-456',
      status: 'Refunded',
      amount: '500.00',
      payment_reference: 'VYL-SVC-002',
      account_number: '****3333',
      service_type: 'ELECTRICITY',
      created_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '3333333333')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    await waitFor(() => {
      expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Pay KES 500.00'))

    await waitFor(() => {
      expect(screen.getByText('Payment Refunded')).toBeInTheDocument()
      expect(screen.getByText(/wallet has been refunded/i)).toBeInTheDocument()
    })
  })

  it('shows pending state for a pending payment', async () => {
    api.get.mockImplementation(walletMock())
    api.post.mockResolvedValue(paymentEnvelope({
      id: 'pay-789',
      status: 'Pending',
      amount: '500.00',
      payment_reference: 'VYL-SVC-003',
      account_number: '****2222',
      service_type: 'ELECTRICITY',
      created_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })

    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '2222222222')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    await waitFor(() => {
      expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Pay KES 500.00'))

    await waitFor(() => {
      expect(screen.getByText('Payment Pending')).toBeInTheDocument()
      expect(screen.getByText(/awaiting confirmation/i)).toBeInTheDocument()
    })
  })
})

// ── Idempotency & Retry Safety ─────────────────────────────────────────────
describe('Idempotency & Retry Safety', () => {
  beforeEach(() => vi.clearAllMocks())

  const mockService = { id: 1, service_type: 'ELECTRICITY', display_name: 'Electricity', name: 'Electricity' }
  const mockWallet = { balance: 5000, currency: 'KES' }

  function walletMock() {
    return (url) => {
      if (url === '/wallet') return Promise.resolve({ data: { data: { wallet: mockWallet } } })
      return Promise.resolve({ data: { data: { services: [] } } })
    }
  }

  async function fillAndReview(user, service, Component) {
    renderWithProviders(<Component />, { initialEntries: [{ pathname: '/service-payment', state: { service } }] })
    await waitFor(() => {
      expect(screen.getByLabelText('Meter number')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))
    await waitFor(() => expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument())
  }

  it('generates a unique idempotency key per mount (UUID format)', async () => {
    api.get.mockImplementation(walletMock())
    api.post.mockResolvedValue(paymentEnvelope({
      id: 'pay-123', status: 'Completed', amount: '500.00', payment_reference: 'VYL-SVC-001',
      result_metadata: {}, account_number: '****7890', service_type: 'ELECTRICITY',
      created_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })
    await waitFor(() => expect(screen.getByLabelText('Meter number')).toBeInTheDocument())

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))
    await waitFor(() => expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument())
    await user.click(screen.getByText('Pay KES 500.00'))

    await waitFor(() => expect(api.post).toHaveBeenCalled())
    const key = api.post.mock.calls[0][1].idempotency_key
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('reuses the SAME idempotency key when retrying after a lost/network error', async () => {
    api.get.mockImplementation(walletMock())
    // First call: network failure (no response). Second call: success.
    api.post.mockRejectedValueOnce(new Error('Network Error'))
    api.post.mockResolvedValueOnce(paymentEnvelope({
      id: 'pay-123', status: 'Completed', amount: '500.00', payment_reference: 'VYL-SVC-001',
      result_metadata: {}, account_number: '****7890', service_type: 'ELECTRICITY',
      created_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    const user = userEvent.setup()
    await fillAndReview(user, mockService, ServicePayment)

    // First attempt fails.
    await user.click(screen.getByText('Pay KES 500.00'))
    await waitFor(() => expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument())

    // Retry.
    await user.click(screen.getByText('Pay KES 500.00'))
    await waitFor(() => expect(screen.getByText('Payment Successful!')).toBeInTheDocument())

    expect(api.post).toHaveBeenCalledTimes(2)
    const firstKey = api.post.mock.calls[0][1].idempotency_key
    const secondKey = api.post.mock.calls[1][1].idempotency_key
    expect(secondKey).toBe(firstKey) // must be identical to avoid a second debit
  })

  it('generates a NEW idempotency key for a separate payment session', async () => {
    api.get.mockImplementation(walletMock())
    api.post.mockResolvedValue(paymentEnvelope({
      id: 'pay-x', status: 'Completed', amount: '500.00', payment_reference: 'VYL-SVC-001',
      result_metadata: {}, account_number: '****7890', service_type: 'ELECTRICITY',
      created_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    const user = userEvent.setup()

    const { unmount } = renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })
    await waitFor(() => expect(screen.getByLabelText('Meter number')).toBeInTheDocument())
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))
    await waitFor(() => expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument())
    await user.click(screen.getByText('Pay KES 500.00'))
    await waitFor(() => expect(api.post).toHaveBeenCalled())
    const firstKey = api.post.mock.calls[0][1].idempotency_key
    unmount()

    // Fresh mount = fresh payment attempt = fresh key.
    renderWithProviders(<ServicePayment />, { initialEntries: [{ pathname: '/service-payment', state: { service: mockService } }] })
    await waitFor(() => expect(screen.getByLabelText('Meter number')).toBeInTheDocument())
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))
    await waitFor(() => expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument())
    await user.click(screen.getByText('Pay KES 500.00'))
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2))
    const secondKey = api.post.mock.calls[1][1].idempotency_key
    expect(secondKey).not.toBe(firstKey)
  })

  it('does NOT send two requests on a rapid double-click', async () => {
    api.get.mockImplementation(walletMock())
    api.post.mockImplementation(() => new Promise((resolve) =>
      setTimeout(() => resolve(paymentEnvelope({
        id: 'pay-123', status: 'Completed', amount: '500.00', payment_reference: 'VYL-SVC-001',
        result_metadata: {}, account_number: '****7890', service_type: 'ELECTRICITY',
        created_at: '2026-08-30T10:00:00Z',
      })), 200)
    ))

    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    const user = userEvent.setup()
    await fillAndReview(user, mockService, ServicePayment)

    const payButton = screen.getByText('Pay KES 500.00')
    // Two synchronous clicks in the same tick: the ref guard must block the 2nd.
    fireEvent.click(payButton)
    fireEvent.click(payButton)

    await waitFor(() => expect(screen.getByText('Payment Successful!')).toBeInTheDocument())
    expect(api.post).toHaveBeenCalledTimes(1)
  })
})

// ── ServicePaymentHistory ──────────────────────────────────────────────────
describe('ServicePaymentHistory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and displays payment history (reads data.payments)', async () => {
    api.get.mockResolvedValue(listEnvelope([
      { id: 'pay-1', service_type: 'ELECTRICITY', amount: '500.00', status: 'Completed', payment_reference: 'VYL-SVC-001', created_at: '2026-08-30T10:00:00Z' },
      { id: 'pay-2', service_type: 'AIRTIME', amount: '200.00', status: 'Refunded', payment_reference: 'VYL-SVC-002', created_at: '2026-08-29T09:00:00Z' },
    ]))

    const { default: ServicePaymentHistory } = await import('../pages/Services/ServicePaymentHistory')
    renderWithProviders(<ServicePaymentHistory />, { initialEntries: ['/service-payments'] })

    expect(screen.getByText('Loading…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeInTheDocument()
      expect(screen.getByText(/VYL-SVC-001/)).toBeInTheDocument()
      expect(screen.getByText(/VYL-SVC-002/)).toBeInTheDocument()
    })
  })

  it('enables Next only when pagination.has_next is true', async () => {
    api.get.mockResolvedValue(listEnvelope([
      { id: 'pay-1', service_type: 'ELECTRICITY', amount: '500.00', status: 'Completed', payment_reference: 'VYL-SVC-001', created_at: '2026-08-30T10:00:00Z' },
    ], true))

    const { default: ServicePaymentHistory } = await import('../pages/Services/ServicePaymentHistory')
    renderWithProviders(<ServicePaymentHistory />, { initialEntries: ['/service-payments'] })

    await waitFor(() => expect(screen.getByText('Payment History')).toBeInTheDocument())
    const next = screen.getByText('Next →')
    expect(next).not.toBeDisabled()
  })

  it('shows empty state', async () => {
    api.get.mockResolvedValue(listEnvelope([]))
    const { default: ServicePaymentHistory } = await import('../pages/Services/ServicePaymentHistory')
    renderWithProviders(<ServicePaymentHistory />, { initialEntries: ['/service-payments'] })

    await waitFor(() => {
      expect(screen.getByText('No service payments yet.')).toBeInTheDocument()
    })
  })

  it('shows error state', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Load failed' } } })
    const { default: ServicePaymentHistory } = await import('../pages/Services/ServicePaymentHistory')
    renderWithProviders(<ServicePaymentHistory />, { initialEntries: ['/service-payments'] })

    await waitFor(() => {
      expect(screen.getByText('Load failed')).toBeInTheDocument()
    })
  })
})

// ── service_type Contract (Services listing → payment POST) ────────────────
// Regression cover for the production 400:
//   POST /api/service-payments -> 400
//   "Invalid service type. Must be one of: ELECTRICITY, WATER, AIRTIME"
// GET /api/services returns the enum under `service_type` (with `type` as a
// legacy alias). The page previously read only `service_type` on a response
// that carried only `type`, so it posted service_type: "" and the backend
// rejected it. These tests drive the real Services -> ServicePayment
// navigation, so the value actually taken from the listing is asserted.
describe('service_type contract: listing value is posted verbatim', () => {
  beforeEach(() => vi.clearAllMocks())

  const mockWallet = { balance: 5000, currency: 'KES' }

  function apiGetMock(services) {
    return (url) => {
      if (url === '/wallet') return Promise.resolve({ data: { data: { wallet: mockWallet } } })
      if (url === '/services') return Promise.resolve({ data: { data: { services } } })
      return Promise.resolve({ data: { data: {} } })
    }
  }

  async function renderServicesFlow(services) {
    api.get.mockImplementation(apiGetMock(services))
    const { default: Services } = await import('../pages/Services/Services')
    const { default: ServicePayment } = await import('../pages/Services/ServicePayment')
    const store = makeStore()

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/services']}>
          <Routes>
            <Route path="/services" element={<Services />} />
            <Route path="/service-payment" element={<ServicePayment />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // Let the listing finish loading inside act() before the test interacts.
    await waitFor(() =>
      expect(screen.queryByText('Loading services…')).not.toBeInTheDocument()
    )
  }

  // Field label rendered by ServicePayment for each backend enum value.
  const FIELD_LABEL = {
    ELECTRICITY: 'Meter number',
    WATER: 'Account number',
    AIRTIME: 'Phone number',
  }
  const ACCOUNT_INPUT = {
    ELECTRICITY: '1234567890',
    WATER: '1234567890',
    AIRTIME: '0712345678',
  }

  async function payFirstService(user, serviceType, cardLabel) {
    await waitFor(() => expect(screen.getByText(cardLabel)).toBeInTheDocument())
    await user.click(screen.getByText(cardLabel))

    const label = FIELD_LABEL[serviceType]
    await waitFor(() => expect(screen.getByLabelText(label)).toBeInTheDocument())

    await user.type(screen.getByLabelText(label), ACCOUNT_INPUT[serviceType])
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))
    await waitFor(() => expect(screen.getByText('Pay KES 500.00')).toBeInTheDocument())
    await user.click(screen.getByText('Pay KES 500.00'))
    await waitFor(() => expect(api.post).toHaveBeenCalled())
  }

  it.each(['ELECTRICITY', 'WATER', 'AIRTIME'])(
    'posts %s exactly as returned by GET /api/services',
    async (serviceType) => {
      const displayName = `${serviceType[0]}${serviceType.slice(1).toLowerCase()}`
      // Exact backend payload shape (app/models/service_payment.py to_dict).
      const service = {
        id: 1,
        name: displayName,
        service_type: serviceType,
        type: serviceType,
        display_name: displayName,
        description: 'Simulated service',
        is_active: true,
      }

      api.post.mockResolvedValue(paymentEnvelope({
        id: 'pay-1', status: 'Completed', amount: '500.00',
        payment_reference: 'VYL-SVC-001', result_metadata: {},
        account_number: '****7890', service_type: serviceType,
        created_at: '2026-08-30T10:00:00Z',
      }))

      await renderServicesFlow([service])
      const user = userEvent.setup()
      await payFirstService(user, serviceType, displayName)

      expect(api.post).toHaveBeenCalledWith('/service-payments', expect.objectContaining({
        service_type: serviceType,
      }))
      // The bug: an empty/undefined service_type must never be sent.
      const payload = api.post.mock.calls[0][1]
      expect(payload.service_type).toBeTruthy()
      expect(['ELECTRICITY', 'WATER', 'AIRTIME']).toContain(payload.service_type)
    }
  )

  it('falls back to the legacy `type` key when `service_type` is absent', async () => {
    // Older backend response shape: only `type` carried the enum value.
    const service = {
      id: 2,
      name: 'Water',
      type: 'WATER',
      display_name: 'Water',
      description: 'Simulated service',
      is_active: true,
    }

    api.post.mockResolvedValue(paymentEnvelope({
      id: 'pay-2', status: 'Completed', amount: '500.00',
      payment_reference: 'VYL-SVC-002', result_metadata: {},
      account_number: '****7890', service_type: 'WATER',
      created_at: '2026-08-30T10:00:00Z',
    }))

    await renderServicesFlow([service])
    const user = userEvent.setup()
    await payFirstService(user, 'WATER', 'Water')

    expect(api.post).toHaveBeenCalledWith('/service-payments', expect.objectContaining({
      service_type: 'WATER',
    }))
  })

  it('does not POST when the service type cannot be resolved', async () => {
    // A malformed provider entry must fail in the UI, not as a backend 400.
    const service = { id: 3, name: 'Mystery', display_name: 'Mystery' }

    await renderServicesFlow([service])
    const user = userEvent.setup()

    await waitFor(() => expect(screen.getByText('Mystery')).toBeInTheDocument())
    await user.click(screen.getByText('Mystery'))

    // Unknown type falls back to the electricity field layout.
    await waitFor(() => expect(screen.getByLabelText('Meter number')).toBeInTheDocument())
    await user.type(screen.getByLabelText('Meter number'), '1234567890')
    await user.type(screen.getByLabelText('Amount (KES)'), '500')
    await user.click(screen.getByText('Review Payment'))

    expect(
      screen.getByText('This service is unavailable. Please pick a service again.')
    ).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })
})

// ── ServicePaymentDetail ───────────────────────────────────────────────────
describe('ServicePaymentDetail', () => {
  beforeEach(() => vi.clearAllMocks())

  function renderDetail(id, store, Component) {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/service-payments/${id}`]}>
          <Routes>
            <Route path="/service-payments/:id" element={<Component />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
  }

  it('loads and displays payment details (reads data.payment)', async () => {
    api.get.mockResolvedValue(paymentEnvelope({
      id: 'pay-123', service_type: 'ELECTRICITY', amount: '500.00', status: 'Completed',
      payment_reference: 'VYL-SVC-001', result_metadata: { token: 'TEST-ELEC-TOKEN-0001', units: 6.8 },
      account_number: '****7890', created_at: '2026-08-30T10:00:00Z', updated_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePaymentDetail } = await import('../pages/Services/ServicePaymentDetail')
    const store = makeStore()
    renderDetail('pay-123', store, ServicePaymentDetail)

    await waitFor(() => {
      expect(screen.getByText('Payment Details')).toBeInTheDocument()
      expect(screen.getByText('VYL-SVC-001')).toBeInTheDocument()
      expect(screen.getByText('TEST-ELEC-TOKEN-0001')).toBeInTheDocument()
      expect(screen.getByText('6.8 kWh')).toBeInTheDocument()
      expect(screen.getByText('****7890')).toBeInTheDocument()
    })
  })

  it('shows reconcile button for a pending payment', async () => {
    api.get.mockResolvedValue(paymentEnvelope({
      id: 'pay-456', service_type: 'WATER', amount: '300.00', status: 'Pending',
      payment_reference: 'VYL-SVC-002', result_metadata: {}, account_number: '****3210',
      created_at: '2026-08-30T10:00:00Z', updated_at: '2026-08-30T10:00:00Z',
    }))

    const { default: ServicePaymentDetail } = await import('../pages/Services/ServicePaymentDetail')
    const store = makeStore()
    renderDetail('pay-456', store, ServicePaymentDetail)

    await waitFor(() => {
      expect(screen.getByText('Complete Payment')).toBeInTheDocument()
    })
  })

  it('reconciles a pending payment to Completed', async () => {
    const pending = {
      id: 'pay-789', service_type: 'AIRTIME', amount: '200.00', status: 'Pending',
      payment_reference: 'VYL-SVC-003', result_metadata: {}, account_number: '****5678',
      created_at: '2026-08-30T10:00:00Z', updated_at: '2026-08-30T10:00:00Z',
    }
    const completed = { ...pending, status: 'Completed', result_metadata: { confirmation_reference: 'VYL-ATM-A1B2C3' } }

    api.get.mockResolvedValue(paymentEnvelope(pending))
    api.post.mockResolvedValue(paymentEnvelope(completed))

    const { default: ServicePaymentDetail } = await import('../pages/Services/ServicePaymentDetail')
    const store = makeStore()
    renderDetail('pay-789', store, ServicePaymentDetail)

    await waitFor(() => {
      expect(screen.getByText('Complete Payment')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.click(screen.getByText('Complete Payment'))

    await waitFor(() => {
      const completed = screen.getAllByText('Completed')
      expect(completed.length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getByText('VYL-ATM-A1B2C3')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/service-payments/pay-789/reconcile')
  })

  it('repeated reconciliation of a terminal payment is a safe no-op', async () => {
    const completed = {
      id: 'pay-999', service_type: 'ELECTRICITY', amount: '100.00', status: 'Completed',
      payment_reference: 'VYL-SVC-009', result_metadata: { token: 'TEST-ELEC-TOKEN-0002' },
      account_number: '****6789', created_at: '2026-08-30T10:00:00Z', updated_at: '2026-08-30T10:01:00Z',
    }
    api.get.mockResolvedValue(paymentEnvelope(completed))
    // Backend returns the same terminal payment (idempotent reconcile).
    api.post.mockResolvedValue(paymentEnvelope(completed))

    const { default: ServicePaymentDetail } = await import('../pages/Services/ServicePaymentDetail')
    const store = makeStore()
    renderDetail('pay-999', store, ServicePaymentDetail)

    await waitFor(() => expect(screen.getByText('Payment Details')).toBeInTheDocument())
    // No reconcile button for a terminal payment.
    expect(screen.queryByText('Complete Payment')).not.toBeInTheDocument()
  })

  it('shows error state for a missing payment', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Payment not found' } } })
    const { default: ServicePaymentDetail } = await import('../pages/Services/ServicePaymentDetail')
    const store = makeStore()
    renderDetail('nonexistent', store, ServicePaymentDetail)

    await waitFor(() => {
      expect(screen.getByText('Payment not found')).toBeInTheDocument()
    })
  })
})

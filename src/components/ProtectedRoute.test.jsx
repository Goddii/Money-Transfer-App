import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../components/ProtectedRoute';
import authReducer from '../store/authSlice';

function makeStore({ isAuthenticated, role }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated,
        user: isAuthenticated ? { id: 1, name: 'T', role } : null,
        token: isAuthenticated ? 'tok' : null,
      },
    },
  });
}

function renderRoute(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/users']}>
        <ProtectedRoute adminOnly>
          <div>secret admin content</div>
        </ProtectedRoute>
      </MemoryRouter>
    </Provider>
  );
}

describe('ProtectedRoute admin guard', () => {
  it('redirects unauthenticated users away from admin content', () => {
    renderRoute(makeStore({ isAuthenticated: false, role: 'user' }));
    expect(screen.queryByText('secret admin content')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admins away from admin content', () => {
    renderRoute(makeStore({ isAuthenticated: true, role: 'user' }));
    expect(screen.queryByText('secret admin content')).not.toBeInTheDocument();
  });

  it('renders admin content for authenticated admins', () => {
    renderRoute(makeStore({ isAuthenticated: true, role: 'admin' }));
    expect(screen.getByText('secret admin content')).toBeInTheDocument();
  });
});

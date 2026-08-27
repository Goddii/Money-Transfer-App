import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import authReducer from '../store/authSlice';

function makeStore(user) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user, token: user ? 'tok' : null, isAuthenticated: !!user },
    },
  });
}

function renderMenu(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route path="/home" element={<UserMenu size={40} />} />
          <Route path="/login" element={<div>login page</div>} />
          <Route path="/profile" element={<div>profile page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('UserMenu', () => {
  it('dispatches the shared logout action and redirects to login', () => {
    localStorage.setItem('token', 'tok');
    const store = makeStore({
      id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
    });

    renderMenu(store);

    fireEvent.click(screen.getByLabelText('Account menu'));
    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it('navigates to the profile page from the menu', () => {
    const store = makeStore({
      id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
    });

    renderMenu(store);

    fireEvent.click(screen.getByLabelText('Account menu'));
    fireEvent.click(screen.getByText('Profile'));

    expect(screen.getByText('profile page')).toBeInTheDocument();
  });

  it('shows the authenticated user identity', () => {
    const store = makeStore({
      id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
    });

    renderMenu(store);

    fireEvent.click(screen.getByLabelText('Account menu'));

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});

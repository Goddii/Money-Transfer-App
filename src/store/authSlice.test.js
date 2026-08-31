import { describe, it, expect } from 'vitest';
import authReducer, { loginSuccess, logout, updateUser } from '../store/authSlice';

describe('authSlice', () => {
  it('starts unauthenticated when no stored token', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('loginSuccess stores user and token and authenticates', () => {
    const user = { id: 1, name: 'Jane', role: 'user' };
    const state = authReducer(undefined, loginSuccess({ user, token: 'tok' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('tok');
    expect(state.user.name).toBe('Jane');
  });

  it('logout clears auth state', () => {
    const authed = authReducer(undefined, loginSuccess({ user: { id: 1 }, token: 't' }));
    const state = authReducer(authed, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('updateUser merges new fields', () => {
    const authed = authReducer(undefined, loginSuccess({ user: { id: 1, name: 'A', email: 'a@x.com' }, token: 't' }));
    const state = authReducer(authed, updateUser({ name: 'B' }));
    expect(state.user.name).toBe('B');
    expect(state.user.email).toBe('a@x.com');
  });
});

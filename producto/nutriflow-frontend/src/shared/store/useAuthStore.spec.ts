import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import type { Session, User } from '@supabase/supabase-js';

const mockUser = { id: 'user-1', email: 'test@test.com' } as User;
const mockSession = { user: mockUser, access_token: 'tok' } as Session;

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });
});

describe('useAuthStore — estado inicial', () => {
  it('arranca sin usuario ni sesión', () => {
    const { user, session, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(session).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('isLoading arranca en true (sesión pendiente de verificar)', () => {
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});

describe('setSession', () => {
  it('con sesión válida: setea user, isAuthenticated=true, isLoading=false', () => {
    useAuthStore.getState().setSession(mockSession);
    const { user, session, isAuthenticated, isLoading } = useAuthStore.getState();
    expect(user).toBe(mockUser);
    expect(session).toBe(mockSession);
    expect(isAuthenticated).toBe(true);
    expect(isLoading).toBe(false);
  });

  it('con null: limpia user, isAuthenticated=false, isLoading=false', () => {
    useAuthStore.getState().setSession(mockSession);
    useAuthStore.getState().setSession(null);
    const { user, session, isAuthenticated, isLoading } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(session).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(isLoading).toBe(false);
  });
});

describe('setLoading', () => {
  it('solo modifica isLoading, no toca el resto del estado', () => {
    useAuthStore.getState().setSession(mockSession);
    useAuthStore.getState().setLoading(true);
    const { user, session, isAuthenticated, isLoading } = useAuthStore.getState();
    expect(isLoading).toBe(true);
    expect(user).toBe(mockUser);
    expect(session).toBe(mockSession);
    expect(isAuthenticated).toBe(true);
  });
});

describe('clear', () => {
  it('resetea todo a null/false/false', () => {
    useAuthStore.getState().setSession(mockSession);
    useAuthStore.getState().clear();
    const { user, session, isAuthenticated, isLoading } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(session).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(isLoading).toBe(false);
  });
});

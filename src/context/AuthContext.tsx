import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import type { User } from '../types/auth';

// ─── Crypto helpers ────────────────────────────────────────────────────────────

const hexEncode = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const randomHex = (bytes = 16): string => {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return hexEncode(buf.buffer);
};

const sha256 = async (data: string): Promise<string> => {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return hexEncode(hash);
};

const hashPassword = async (password: string, salt: string): Promise<string> =>
  sha256(salt + password);

// ─── Storage helpers ───────────────────────────────────────────────────────────

const USERS_KEY = 'teachreflect_users';
const SESSION_KEY = 'teachreflect_session';

const loadUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
};

const loadSession = (): string | null => {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

const saveSession = (userId: string | null): void => {
  try {
    if (userId) {
      sessionStorage.setItem(SESSION_KEY, userId);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
};

// ─── Context value ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restore session synchronously via lazy initializer to avoid setState-in-effect
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userId = loadSession();
    if (!userId) return null;
    const users = loadUsers();
    return users.find((u) => u.id === userId) ?? null;
  });
  const isLoading = false;

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    const hash = await hashPassword(password, user.passwordSalt);
    if (hash !== user.passwordHash) return false;
    saveSession(user.id);
    setCurrentUser(user);
    return true;
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const users = loadUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const salt = randomHex(16);
      const passwordHash = await hashPassword(password, salt);
      const now = new Date().toISOString();
      const user: User = {
        id: randomHex(16),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        passwordSalt: salt,
        created_at: now,
      };
      saveUsers([...users, user]);
      saveSession(user.id);
      setCurrentUser(user);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    saveSession(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

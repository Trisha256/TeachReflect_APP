// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // SHA-256 hex digest
  passwordSalt: string; // Random hex salt
  created_at: string;
}

export interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
}

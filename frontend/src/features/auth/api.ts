import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/user';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiClient
      .post<{ message: string }>('/auth/register', data)
      .then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  me: () => apiClient.get<User>('/users/me').then((r) => r.data),
  verifyEmail: (token: string) =>
    apiClient.post<AuthResponse>('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: (email: string) =>
    apiClient
      .post<{ message: string }>('/auth/resend-verification', { email })
      .then((r) => r.data),
  forgotPassword: (email: string) =>
    apiClient
      .post<{ message: string }>('/auth/forgot-password', { email })
      .then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    apiClient
      .post<AuthResponse>('/auth/reset-password', { token, password })
      .then((r) => r.data),
};

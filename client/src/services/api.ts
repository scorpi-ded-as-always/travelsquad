import api from '@/lib/axios';
import { Trip, Squad, Message, User, Pagination } from '@/types';

// ─── Trips ───────────────────────────────────────────────────────────────────
export const tripsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<{ trips: Trip[]; pagination: Pagination }>('/trips', { params }),

  getById: (id: string) =>
    api.get<{ trip: Trip }>(`/trips/${id}`),

  getMine: () =>
    api.get<{ trips: Trip[] }>('/trips/my'),

  getMatches: () =>
    api.get<{ matches: Trip[] }>('/trips/match'),

  create: (data: Partial<Trip>) =>
    api.post<{ trip: Trip }>('/trips', data),

  update: (id: string, data: Partial<Trip>) =>
    api.put<{ trip: Trip }>(`/trips/${id}`, data),

  delete: (id: string) =>
    api.delete(`/trips/${id}`),
};

// ─── Squads ──────────────────────────────────────────────────────────────────
export const squadsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<{ squads: Squad[]; pagination: Pagination }>('/squads', { params }),

  getById: (id: string) =>
    api.get<{ squad: Squad }>(`/squads/${id}`),

  getMine: () =>
    api.get<{ squads: Squad[] }>('/squads/my'),

  create: (data: Partial<Squad>) =>
    api.post<{ squad: Squad }>('/squads', data),

  requestJoin: (id: string, message?: string) =>
    api.post(`/squads/${id}/join`, { message }),

  handleJoinRequest: (squadId: string, requestId: string, action: 'approved' | 'rejected') =>
    api.put(`/squads/${squadId}/join/${requestId}`, { action }),

  leave: (id: string) =>
    api.delete(`/squads/${id}/leave`),

  addItinerary: (id: string, item: any) =>
    api.post<{ squad: Squad }>(`/squads/${id}/itinerary`, item),

  removeItinerary: (squadId: string, itemId: string) =>
    api.delete(`/squads/${squadId}/itinerary/${itemId}`),
};

// ─── Messages ────────────────────────────────────────────────────────────────
export const messagesApi = {
  getBySquad: (squadId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ messages: Message[] }>(`/messages/${squadId}`, { params }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getById: (id: string) =>
    api.get<{ user: User }>(`/users/${id}`),

  search: (params: { q?: string; interest?: string }) =>
    api.get<{ users: User[] }>('/users/search', { params }),

  updateProfile: (data: Partial<User> & { password?: string }) =>
    api.put<{ user: User }>('/auth/profile', data),
};

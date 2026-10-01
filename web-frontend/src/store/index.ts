import { create } from 'zustand';

interface AuthState {
  user: any | null;
  activeFamilyProfileId: string;
  setUser: (user: any) => void;
  setActiveFamilyProfileId: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'usr-default-alex',
    fullName: 'Alex Mercer',
    email: 'alex@kshurak.com',
    role: 'CUSTOMER',
  },
  activeFamilyProfileId: 'self',
  setUser: (user) => set({ user }),
  setActiveFamilyProfileId: (id) => set({ activeFamilyProfileId: id }),
  logout: () => set({ user: null }),
}));

interface QuizState {
  answers: Record<string, any>;
  setAnswer: (key: string, value: any) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  answers: {},
  setAnswer: (key, value) => set((state) => ({ answers: { ...state.answers, [key]: value } })),
  resetQuiz: () => set({ answers: {} }),
}));

interface QueueState {
  currentTicketId: string | null;
  positionInLine: number | null;
  estimatedWaitMinutes: number | null;
  setTicket: (ticketId: string, pos: number, wait: number) => void;
  clearTicket: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  currentTicketId: null,
  positionInLine: null,
  estimatedWaitMinutes: null,
  setTicket: (ticketId, pos, wait) =>
    set({ currentTicketId: ticketId, positionInLine: pos, estimatedWaitMinutes: wait }),
  clearTicket: () =>
    set({ currentTicketId: null, positionInLine: null, estimatedWaitMinutes: null }),
}));

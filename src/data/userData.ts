import { container } from './cosmosClient';

export interface UserData {
  id: string;
  creditCards: CreditCard[];
  bills: Bill[];
  income: IncomeData;
  savings: SavingsData;
  month: string; // e.g. '2025-05'
}

export interface CreditCard {
  id: string;
  name: string;
  dateOpened: string;
  creditLimit: number;
  currentBalance: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paycheckLabel: '15th' | 'last';
}

export interface IncomeData {
  salary: number;
  k401Percent: number;
  esppPercent: number;
  insurance: number;
  bonusPercent: number;
}

export interface SavingsData {
  estimatedMonthlySavings: number;
}

// MOCK DATA LAYER FOR LOCAL DEVELOPMENT
const isDev = import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'development';

const mockUser: UserData = {
  id: 'demo-user',
  creditCards: [],
  bills: [],
  income: {
    salary: 80000,
    k401Percent: 5,
    esppPercent: 10,
    insurance: 2000,
    bonusPercent: 10,
  },
  savings: { estimatedMonthlySavings: 0 },
  month: '2025-05',
};

let mockDb: Record<string, UserData> = { [mockUser.id]: { ...mockUser } };

export async function getUserData(userId: string): Promise<UserData | null> {
  if (isDev) {
    return mockDb[userId] ? { ...mockDb[userId] } : null;
  }
  try {
    const { resource } = await container.item(userId, userId).read<UserData>();
    return resource || null;
  } catch (err) {
    if (err.code === 404) return null;
    throw err;
  }
}

export async function setUserData(userData: UserData): Promise<void> {
  if (isDev) {
    mockDb[userData.id] = { ...userData };
    return;
  }
  await container.items.upsert(userData);
}

export async function resetUserData(userId: string, month: string): Promise<void> {
  if (isDev) {
    const data = mockDb[userId];
    if (!data) return;
    data.creditCards.forEach(card => (card.currentBalance = 0));
    data.bills.forEach(bill => (bill.paid = false));
    data.savings.estimatedMonthlySavings = 0;
    data.month = month;
    mockDb[userId] = { ...data };
    return;
  }
  const data = await getUserData(userId);
  if (!data) return;
  data.creditCards.forEach(card => (card.currentBalance = 0));
  data.bills.forEach(bill => (bill.paid = false));
  data.savings.estimatedMonthlySavings = 0;
  data.month = month;
  await setUserData(data);
}

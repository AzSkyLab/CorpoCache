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

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { resource } = await container.item(userId, userId).read<UserData>();
    return resource || null;
  } catch (err) {
    if (err.code === 404) return null;
    throw err;
  }
}

export async function setUserData(userData: UserData): Promise<void> {
  await container.items.upsert(userData);
}

export async function resetUserData(userId: string, month: string): Promise<void> {
  const data = await getUserData(userId);
  if (!data) return;
  data.creditCards.forEach(card => (card.currentBalance = 0));
  data.bills.forEach(bill => (bill.paid = false));
  data.savings.estimatedMonthlySavings = 0;
  data.month = month;
  await setUserData(data);
}

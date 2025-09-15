import type { Transaction } from './types';

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-01', description: 'Monthly Salary', amount: 5000, type: 'income', category: 'fixed' },
  { id: '2', date: '2024-07-01', description: 'Rent', amount: 1200, type: 'expense', category: 'fixed' },
  { id: '3', date: '2024-07-03', description: 'Groceries', amount: 150.75, type: 'expense', category: 'variable' },
  { id: '4', date: '2024-07-05', description: 'Internet Bill', amount: 60, type: 'expense', category: 'fixed' },
  { id: '5', date: '2024-07-10', description: 'Dinner with friends', amount: 85.50, type: 'expense', category: 'variable' },
  { id: '6', date: '2024-07-12', description: 'Freelance Project', amount: 750, type: 'income', category: 'variable' },
  { id: '7', date: '2024-07-15', description: 'Gym Membership', amount: 40, type: 'expense', category: 'fixed' },
  { id: '8', date: '2024-07-18', description: 'New Shoes', amount: 120, type: 'expense', category: 'variable' },
  { id: '9', date: '2024-07-20', description: 'Electricity Bill', amount: 75, type: 'expense', category: 'fixed' },
  { id: '10', date: '2024-07-22', description: 'Movie Tickets', amount: 25, type: 'expense', category: 'variable' },
  { id: '11', date: '2024-07-25', description: 'Public Transport', amount: 50, type: 'expense', category: 'variable' },
  { id: '12', date: '2024-07-28', description: 'Stock Dividend', amount: 125, type: 'income', category: 'variable' },
];

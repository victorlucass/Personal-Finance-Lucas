import type { Transaction } from './types';

export let mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-01', description: 'Salário Mensal', amount: 5000, type: 'income', category: 'fixed' },
  { id: '2', date: '2024-07-01', description: 'Aluguel', amount: 1200, type: 'expense', category: 'fixed' },
  { id: '3', date: '2024-07-03', description: 'Supermercado', amount: 150.75, type: 'expense', category: 'variable' },
  { id: '4', date: '2024-07-05', description: 'Conta de Internet', amount: 60, type: 'expense', category: 'fixed' },
  { id: '5', date: '2024-07-10', description: 'Jantar com amigos', amount: 85.50, type: 'expense', category: 'variable' },
  { id: '6', date: '2024-07-12', description: 'Projeto Freelance', amount: 750, type: 'income', category: 'variable' },
  { id: '7', date: '2024-07-15', description: 'Academia', amount: 40, type: 'expense', category: 'fixed' },
  { id: '8', date: '2024-07-18', description: 'Sapatos Novos', amount: 120, type: 'expense', category: 'variable' },
  { id: '9', date: '2024-07-20', description: 'Conta de Luz', amount: 75, type: 'expense', category: 'fixed' },
  { id: '10', date: '2024-07-22', description: 'Ingressos de Cinema', amount: 25, type: 'expense', category: 'variable' },
  { id: '11', date: '2024-07-25', description: 'Transporte Público', amount: 50, type: 'expense', category: 'variable' },
  { id: '12', date: '2024-07-28', description: 'Dividendo de Ações', amount: 125, type: 'income', category: 'variable' },
];

// This is a mock database. In a real application, you would use a proper database.
export const dataStore = {
  getTransactions: () => mockTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  addTransaction: (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    mockTransactions.push(newTransaction);
    return newTransaction;
  },
  updateTransaction: (updatedTransaction: Transaction) => {
    mockTransactions = mockTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    return updatedTransaction;
  },
  deleteTransaction: (id: string) => {
    mockTransactions = mockTransactions.filter(t => t.id !== id);
  },
  clearAllTransactions: () => {
    mockTransactions = [];
  },
  findTransactionById: (id: string) => {
    return mockTransactions.find(t => t.id === id);
  }
};

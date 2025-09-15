export type Transaction = {
  id: string;
  date: string; // Competence date
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'fixed' | 'variable';
  paymentDate?: string; // for income
  dueDate?: string; // for expense
};

export type CreditCardTransaction = {
  storeName: string;
  amount: number;
  description: string;
};

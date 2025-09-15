export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'fixed' | 'variable';
};

export type CreditCardTransaction = {
  storeName: string;
  amount: number;
  description: string;
};

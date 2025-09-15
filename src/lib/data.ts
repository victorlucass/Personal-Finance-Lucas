import type { Transaction } from './types';
import fs from 'fs';
import path from 'path';

// Caminho para o nosso "banco de dados" JSON
const dbPath = path.resolve(process.cwd(), 'transactions.json');

// Função para ler as transações do arquivo
const readTransactions = (): Transaction[] => {
  try {
    if (!fs.existsSync(dbPath)) {
      // Se o arquivo não existir, cria um com um array vazio
      fs.writeFileSync(dbPath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read transactions:', error);
    return [];
  }
};

// Função para escrever as transações no arquivo
const writeTransactions = (transactions: Transaction[]) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Failed to write transactions:', error);
  }
};

// Inicializa as transações a partir do arquivo
let mockTransactions: Transaction[] = readTransactions();

export const dataStore = {
  getTransactions: () => {
    mockTransactions = readTransactions();
    return mockTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addTransaction: (transaction: Omit<Transaction, 'id'>) => {
    mockTransactions = readTransactions();
    const newTransaction = { ...transaction, id: Date.now().toString() };
    mockTransactions.push(newTransaction);
    writeTransactions(mockTransactions);
    return newTransaction;
  },
  updateTransaction: (updatedTransaction: Transaction) => {
    mockTransactions = readTransactions();
    mockTransactions = mockTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    writeTransactions(mockTransactions);
    return updatedTransaction;
  },
  deleteTransaction: (id: string) => {
    mockTransactions = readTransactions();
    mockTransactions = mockTransactions.filter(t => t.id !== id);
    writeTransactions(mockTransactions);
  },
  clearAllTransactions: () => {
    mockTransactions = [];
    writeTransactions(mockTransactions);
  },
  findTransactionById: (id: string) => {
    mockTransactions = readTransactions();
    return mockTransactions.find(t => t.id === id);
  }
};

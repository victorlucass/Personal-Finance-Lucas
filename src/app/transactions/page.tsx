"use client";

import { useState } from "react";
import { mockTransactions } from "@/lib/data";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import type { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  const editTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setEditingTransaction(null);
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }
  
  const clearAllTransactions = () => {
    setTransactions([]);
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  }

  const closeEditDialog = () => {
    setEditingTransaction(null);
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TransactionsTable 
            transactions={transactions}
            onEdit={openEditDialog}
            onDelete={deleteTransaction}
            onClearAll={clearAllTransactions}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
                <CardTitle>Adicionar Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm onAddTransaction={addTransaction}/>
            </CardContent>
          </Card>
        </div>
      </div>
      {editingTransaction && (
        <EditTransactionDialog
            transaction={editingTransaction}
            onUpdateTransaction={editTransaction}
            onClose={closeEditDialog}
        />
      )}
    </div>
  );
}

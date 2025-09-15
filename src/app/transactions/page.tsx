"use client";

import { useState, useEffect } from "react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error('Failed to add transaction');
      fetchTransactions(); // Re-fetch to update the list
    } catch (error) {
       toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação.",
        variant: "destructive",
      });
    }
  }

  const editTransaction = async (updatedTransaction: Transaction) => {
    try {
        const response = await fetch(`/api/transactions/${updatedTransaction.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTransaction),
        });
        if (!response.ok) throw new Error('Failed to update transaction');
        fetchTransactions();
        setEditingTransaction(null);
        toast({
            title: "Sucesso",
            description: "Transação atualizada."
        })
    } catch (error) {
        toast({
            title: "Erro",
            description: "Não foi possível atualizar a transação.",
            variant: "destructive",
        });
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
        const response = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete transaction');
        fetchTransactions();
        toast({
            title: "Sucesso",
            description: "Transação apagada."
        })
    } catch (error) {
        toast({
            title: "Erro",
            description: "Não foi possível apagar a transação.",
            variant: "destructive",
        });
    }
  }
  
  const clearAllTransactions = async () => {
    try {
        const response = await fetch('/api/transactions', {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to clear transactions');
        fetchTransactions();
        toast({
            title: "Sucesso",
            description: "Todas as transações foram apagadas."
        })
    } catch (error) {
         toast({
            title: "Erro",
            description: "Não foi possível limpar as transações.",
            variant: "destructive",
        });
    }
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

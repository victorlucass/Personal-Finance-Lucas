"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import type { Transaction } from "@/lib/types";

type EditTransactionDialogProps = {
  transaction: Transaction;
  onUpdateTransaction: (transaction: Transaction) => void;
  onClose: () => void;
};

export function EditTransactionDialog({
  transaction,
  onUpdateTransaction,
  onClose,
}: EditTransactionDialogProps) {

  const handleUpdate = (updatedData: Omit<Transaction, 'id'>) => {
    onUpdateTransaction({ ...transaction, ...updatedData });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Faça alterações na sua transação aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
            initialData={transaction}
            onAddTransaction={handleUpdate}
            buttonText="Salvar Alterações"
        />
      </DialogContent>
    </Dialog>
  );
}

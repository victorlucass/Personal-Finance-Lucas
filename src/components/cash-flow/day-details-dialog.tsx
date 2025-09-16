
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

type DayDetailsDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    dayInfo: {
        balance: number;
        transactions: Transaction[];
        dayBalanceChange: number;
    };
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function DayDetailsDialog({ isOpen, onClose, date, dayInfo }: DayDetailsDialogProps) {
    const incomes = dayInfo.transactions.filter(t => t.type === 'income');
    const expenses = dayInfo.transactions.filter(t => t.type === 'expense');
    const startBalance = dayInfo.balance - dayInfo.dayBalanceChange;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalhes do Dia - {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</DialogTitle>
                    <DialogDescription>
                        Veja o resumo financeiro deste dia.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                            <p className="font-semibold text-lg">{currencyFormatter.format(startBalance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Final</p>
                            <p className={cn("font-semibold text-lg", dayInfo.balance >= 0 ? 'text-accent-foreground' : 'text-destructive')}>{currencyFormatter.format(dayInfo.balance)}</p>
                        </div>
                    </div>

                    {incomes.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2 text-accent-foreground">Receitas do dia</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {incomes.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.description}</TableCell>
                                                <TableCell className="text-right font-mono text-accent-foreground">
                                                    {currencyFormatter.format(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    
                    {expenses.length > 0 && (
                         <div>
                            <h3 className="font-semibold mb-2 text-destructive">Despesas do dia</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.description}</TableCell>
                                                <TableCell className="text-right font-mono text-destructive">
                                                   - {currencyFormatter.format(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {incomes.length === 0 && expenses.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Nenhuma transação para este dia.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

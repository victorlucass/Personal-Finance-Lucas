"use client";

import { useState, useMemo, useEffect } from 'react';
import { addDays, startOfToday, eachDayOfInterval, isBefore, isEqual, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { Transaction } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type DailyBalance = {
    date: Date;
    balance: number;
    isPositive: boolean;
};

export function CashFlowCalendar() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const today = startOfToday();
  const projectionDays = 60; // Project for 2 months to fill calendar view
  
  useEffect(() => {
    const fetchTransactions = async () => {
        try {
          const response = await fetch('/api/transactions');
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setTransactions(data);
        } catch (error) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar as transações para o fluxo de caixa.",
            variant: "destructive",
          });
        }
      };

    fetchTransactions();
  }, [toast]);

  const dailyBalances = useMemo(() => {
    if (transactions.length === 0) return {};

    const initialBalance = transactions
      .filter(t => {
        const eventDate = t.type === 'income' ? t.paymentDate : t.dueDate;
        return eventDate && isBefore(new Date(eventDate), today);
      })
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    const interval = {
        start: today,
        end: addDays(today, projectionDays),
    };

    const daysToProject = eachDayOfInterval(interval);
    let accumulatedBalance = initialBalance;

    const balances: Record<string, { balance: number, isPositive: boolean }> = {};

    daysToProject.forEach((day) => {
        const dailyIncome = transactions
            .filter(t => t.type === 'income' && t.paymentDate && isEqual(startOfToday(new Date(t.paymentDate)), day))
            .reduce((acc, t) => acc + t.amount, 0);

        const dailyExpense = transactions
            .filter(t => t.type === 'expense' && t.dueDate && isEqual(startOfToday(new Date(t.dueDate)), day))
            .reduce((acc, t) => acc + t.amount, 0);
        
        const dayBalanceChange = dailyIncome - dailyExpense;
        accumulatedBalance += dayBalanceChange;

        balances[format(day, 'yyyy-MM-dd')] = {
            balance: accumulatedBalance,
            isPositive: accumulatedBalance >= 0,
        };
    });

    return balances;
  }, [transactions, today]);

  const DayWithBalance = ({ date, ...props }: { date: Date } & any) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = dailyBalances[dateString];
    
    // Default day rendering from react-day-picker
    const day = format(date, 'd');
    
    return (
      <div {...props} className={cn(props.className, 'relative h-full w-full flex flex-col justify-between p-1')}>
        <div className="text-sm text-right">{day}</div>
        {dayData && (
          <div className={cn(
            "text-xs font-bold text-center rounded-sm",
            dayData.isPositive ? 'bg-accent/30 text-accent-foreground' : 'bg-destructive/20 text-destructive'
            )}>
             {new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short'
            }).format(dayData.balance)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Calendário de Fluxo de Caixa</CardTitle>
            <CardDescription>
                Veja a projeção do seu saldo para os próximos dias.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Calendar
                locale={ptBR}
                numberOfMonths={2}
                className="p-0"
                classNames={{
                    day: 'h-24 w-full text-left align-top',
                    day_outside: 'text-muted-foreground/50',
                }}
                components={{
                    Day: DayWithBalance,
                }}
            />
        </CardContent>
    </Card>
  );
}

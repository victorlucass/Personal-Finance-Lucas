
"use client";

import { useState, useMemo, useEffect } from 'react';
import { addDays, startOfToday, eachDayOfInterval, isBefore, isEqual, format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { Transaction } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { DayDetailsDialog } from './day-details-dialog';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type DailyBalanceInfo = {
    balance: number;
    isPositive: boolean;
    transactions: Transaction[];
    dayBalanceChange: number;
};

export function CashFlowCalendar() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfToday());
  const { toast } = useToast();
  
  const projectionDays = 90; // Project for ~3 months

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

    const calendarStart = startOfMonth(currentMonth);

    const initialBalance = transactions
      .filter(t => {
        const eventDate = t.type === 'income' ? t.paymentDate : t.dueDate;
        return eventDate && isBefore(new Date(eventDate), calendarStart);
      })
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    const interval = {
        start: calendarStart,
        end: addDays(calendarStart, projectionDays),
    };

    const daysToProject = eachDayOfInterval(interval);
    let accumulatedBalance = initialBalance;

    const balances: Record<string, DailyBalanceInfo> = {};

    daysToProject.forEach((day) => {
        const dayTransactions = transactions.filter(t => {
            const eventDate = t.type === 'income' ? t.paymentDate : t.dueDate;
            return eventDate && isEqual(startOfToday(new Date(eventDate)), day);
        });

        const dailyIncome = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const dailyExpense = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
        
        const dayBalanceChange = dailyIncome - dailyExpense;
        accumulatedBalance += dayBalanceChange;

        balances[format(day, 'yyyy-MM-dd')] = {
            balance: accumulatedBalance,
            isPositive: accumulatedBalance >= 0,
            transactions: dayTransactions,
            dayBalanceChange: dayBalanceChange,
        };
    });

    return balances;
  }, [transactions, currentMonth]);

  const handleDayClick = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    if (dailyBalances[dayString]) {
        setSelectedDay(day);
    }
  };

  const DayWithBalance = ({ date, ...props }: { date: Date } & any) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = dailyBalances[dateString];
    
    const day = format(date, 'd');
    
    return (
      <button 
        {...props} 
        onClick={() => handleDayClick(date)}
        className={cn(
            props.className, 
            'relative h-full w-full flex flex-col justify-between p-1 text-left',
            {'cursor-pointer hover:bg-muted': !!dayData}
        )}
      >
        <div className={cn(
            "text-sm text-right",
            isSameDay(date, startOfToday()) && "font-bold text-primary"
        )}>{day}</div>
        {dayData && (dayData.dayBalanceChange !== 0 || isSameDay(date, startOfToday())) && (
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
      </button>
    );
  };
  
  const selectedDayInfo = useMemo(() => {
    if(!selectedDay) return null;
    const dayString = format(selectedDay, 'yyyy-MM-dd');
    return dailyBalances[dayString];
  }, [selectedDay, dailyBalances]);

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Calendário de Fluxo de Caixa</CardTitle>
                <CardDescription>
                    Clique em um dia para ver os detalhes das transações e o saldo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    locale={ptBR}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    numberOfMonths={2}
                    className="p-0"
                    classNames={{
                        day: 'h-24 w-full p-0 align-top',
                        day_outside: 'text-muted-foreground/50',
                    }}
                    components={{
                        Day: DayWithBalance,
                    }}
                />
            </CardContent>
        </Card>
        {selectedDay && selectedDayInfo && (
            <DayDetailsDialog 
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                date={selectedDay}
                dayInfo={selectedDayInfo}
            />
        )}
    </>
  );
}


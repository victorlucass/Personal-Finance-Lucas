"use client";

import { useState, useMemo, useEffect } from 'react';
import { addDays, format, startOfToday, eachDayOfInterval, isBefore, isEqual, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function DailyCashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const today = startOfToday();
  const projectionDays = 30;
  
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

  const dailyProjectionData = useMemo(() => {
    if (transactions.length === 0) return { chartData: [], initialBalance: 0 };

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

    const chartData = daysToProject.map((day) => {
        const dailyIncome = transactions
            .filter(t => t.type === 'income' && t.paymentDate && isEqual(startOfToday(new Date(t.paymentDate)), day))
            .reduce((acc, t) => acc + t.amount, 0);

        const dailyExpense = transactions
            .filter(t => t.type === 'expense' && t.dueDate && isEqual(startOfToday(new Date(t.dueDate)), day))
            .reduce((acc, t) => acc + t.amount, 0);
        
        const dayBalanceChange = dailyIncome - dailyExpense;
        accumulatedBalance += dayBalanceChange;

        return {
            date: format(day, 'dd/MM'),
            saldo: accumulatedBalance,
        };
    });

    return { chartData, initialBalance };
}, [transactions, today]);


  const { chartData, initialBalance } = dailyProjectionData;

  const chartConfig = {
    saldo: { label: "Saldo", color: "hsl(var(--chart-1))" },
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Inicial Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter.format(initialBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Saldo com base em todas as transações passadas.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Final Projetado</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{currencyFormatter.format(chartData.length > 0 ? chartData[chartData.length - 1].saldo : initialBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Saldo projetado para {format(addDays(today, projectionDays), "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

    <Card>
        <CardHeader>
        <CardTitle>Projeção de Saldo Diário</CardTitle>
        <CardDescription>
            Mostra a evolução do seu saldo dia a dia com base nas datas de pagamento e vencimento.
        </CardDescription>
        </Header>
        <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => currencyFormatter.format(value as number)}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent 
                        formatter={(value, name) => {
                            const formattedValue = currencyFormatter.format(value as number);
                            const label = chartConfig[name as keyof typeof chartConfig]?.label || name;
                            return `${label}: ${formattedValue}`;
                        }}
                    />}
                />
                <Legend />
                <Line type="monotone" dataKey="saldo" stroke="var(--color-saldo)" strokeWidth={2} dot={false} />
            </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
        </CardContent>
    </Card>
    </div>
  );
}

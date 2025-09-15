"use client";

import { useState, useMemo, useEffect } from 'react';
import { addMonths, format, getDaysInMonth, startOfMonth, eachMonthOfInterval, endOfYear, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const calculateMonthlySummary = (transactions: Transaction[]) => {
  const monthlySummary = new Map<string, { income: number; fixed: number; variable: number }>();

  transactions.forEach(t => {
    const monthKey = format(new Date(t.date), 'yyyy-MM');
    if (!monthlySummary.has(monthKey)) {
      monthlySummary.set(monthKey, { income: 0, fixed: 0, variable: 0 });
    }
    const summary = monthlySummary.get(monthKey)!;

    if (t.type === 'income') {
      summary.income += t.amount;
    } else {
      if (t.category === 'fixed') {
        summary.fixed += t.amount;
      } else {
        summary.variable += t.amount;
      }
    }
  });

  return monthlySummary;
};

export function FinancialProjection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const today = new Date();
  const futureMonths = eachMonthOfInterval({
    start: startOfMonth(today),
    end: endOfYear(addMonths(today, 12)),
  });

  const [projectionMonth, setProjectionMonth] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
  
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
            description: "Não foi possível carregar as transações para o painel.",
            variant: "destructive",
          });
        }
      };

    fetchTransactions();

    const handleStorageChange = () => {
        fetchTransactions();
    }
    
    // Using a custom event to trigger refresh from other components
    window.addEventListener('transactions-updated', handleStorageChange);

    return () => {
      window.removeEventListener('transactions-updated', handleStorageChange);
    };

  }, [toast]);

  const processedData = useMemo(() => {
    const monthlySummary = calculateMonthlySummary(transactions);
    const lastRecordedMonth = Array.from(monthlySummary.keys()).sort().pop() || format(today, 'yyyy-MM');
    const base = monthlySummary.get(lastRecordedMonth) || { income: 0, fixed: 0, variable: 0 };
    
    let balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

    const projectionInterval = {
      start: startOfMonth(today),
      end: new Date(projectionMonth),
    };

    const monthsToProject = eachMonthOfInterval(projectionInterval);

    if (monthsToProject.length === 0) return [];

    const chartData = monthsToProject.map(monthDate => {
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthName = format(monthDate, 'MMM', { locale: ptBR });
      
      const historicalData = monthlySummary.get(monthKey);

      if (historicalData) {
        balance += historicalData.income - (historicalData.fixed + historicalData.variable);
        return {
          month: monthName,
          receita: historicalData.income,
          despesa: historicalData.fixed + historicalData.variable,
          saldo: balance,
          isProjection: false,
        };
      } else {
        balance += base.income - (base.fixed + base.variable);
        return {
          month: monthName,
          receita: base.income,
          despesa: base.fixed + base.variable,
          saldo: balance,
          isProjection: true,
        };
      }
    });

    return chartData;
  }, [projectionMonth, transactions, today]);

  const dailyStatus = useMemo(() => {
    const monthlySummary = calculateMonthlySummary(transactions);
    const lastRecordedMonth = Array.from(monthlySummary.keys()).sort().pop() || format(today, 'yyyy-MM');
    const base = monthlySummary.get(lastRecordedMonth) || { income: 0, fixed: 0, variable: 0 };

    const todayIncome = transactions.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const todayExpense = transactions.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    return {
      today: {
        income: todayIncome,
        expense: todayExpense,
        balance: todayIncome - todayExpense,
      },
      endOfMonth: {
        income: base.income,
        expense: base.fixed + base.variable,
        balance: base.income - (base.fixed + base.variable),
      }
    };
  }, [transactions, today]);
  
  const finalBalance = processedData.length > 0 ? processedData[processedData.length - 1]?.saldo || 0 : 0;

  const chartConfig = {
    receita: { label: "Receita", color: "hsl(var(--accent))" },
    despesa: { label: "Despesa", color: "hsl(var(--destructive))" },
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Situação Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter.format(dailyStatus.today.balance)}</div>
            <p className="text-xs text-muted-foreground">
              {currencyFormatter.format(dailyStatus.today.income)} receita vs {currencyFormatter.format(dailyStatus.today.expense)} despesa
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projeção Fim do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter.format(dailyStatus.endOfMonth.balance)}</div>
             <p className="text-xs text-muted-foreground">
              {currencyFormatter.format(dailyStatus.endOfMonth.income)} receita vs {currencyFormatter.format(dailyStatus.endOfMonth.expense)} despesa
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projeção Anual</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{currencyFormatter.format(finalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Saldo projetado para {format(new Date(projectionMonth), "MMM yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selecione o Futuro</CardTitle>
            <CardDescription className="text-xs">Até que mês você quer projetar?</CardDescription>
          </CardHeader>
          <CardContent>
             <Select value={projectionMonth} onValueChange={setProjectionMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {futureMonths.map((month) => (
                  <SelectItem key={month.toISOString()} value={format(endOfMonth(month), 'yyyy-MM-dd')}>
                    {format(month, 'MMMM yyyy', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
          <CardDescription>
            Mostra seu saldo acumulado com base em dados históricos e projeções futuras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
            <BarChart data={processedData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => currencyFormatter.format(value)}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent 
                    formatter={(value, name, props) => {
                        const formattedValue = currencyFormatter.format(value as number);
                        if(name === 'saldo') {
                           return <div className="flex flex-col"><span>Saldo: {formattedValue}</span><span className={`text-xs ${props.payload.isProjection ? 'text-blue-500' : 'text-green-500'}`}>{props.payload.isProjection ? '(Projeção)' : '(Real)'}</span></div>
                        }
                        return `${chartConfig[name as keyof typeof chartConfig].label}: ${formattedValue}`
                    }}
                />}
              />
              <Legend />
              <Bar dataKey="receita" fill="var(--color-receita)" radius={4} />
              <Bar dataKey="despesa" fill="var(--color-despesa)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

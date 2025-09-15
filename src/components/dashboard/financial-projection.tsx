"use client";

import { useState, useMemo, useEffect } from 'react';
import { addMonths, format, startOfMonth, eachMonthOfInterval, endOfYear, endOfMonth, startOfToday, isSameMonth, subMonths, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const calculateMonthlySummary = (transactions: Transaction[]) => {
  const monthlySummary = new Map<string, { income: { fixed: number, variable: number }, expense: { fixed: number; variable: number } }>();

  transactions.forEach(t => {
    const monthKey = format(new Date(t.date), 'yyyy-MM');
    if (!monthlySummary.has(monthKey)) {
      monthlySummary.set(monthKey, { income: { fixed: 0, variable: 0 }, expense: { fixed: 0, variable: 0 } });
    }
    const summary = monthlySummary.get(monthKey)!;

    if (t.type === 'income') {
        if (t.category === 'fixed') {
            summary.income.fixed += t.amount;
        } else {
            summary.income.variable += t.amount;
        }
    } else { // expense
        if (t.category === 'fixed') {
            summary.expense.fixed += t.amount;
        } else {
            summary.expense.variable += t.amount;
        }
    }
  });

  return monthlySummary;
};

export function FinancialProjection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const today = startOfToday();
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
    
    window.addEventListener('transactions-updated', handleStorageChange);

    return () => {
      window.removeEventListener('transactions-updated', handleStorageChange);
    };

  }, [toast]);

  const processedData = useMemo(() => {
    if (transactions.length === 0) return { chartData: [], finalBalance: 0 };
    
    const monthlySummary = calculateMonthlySummary(transactions);

    // Calculate balance from all transactions before the start of the projection interval
    const initialBalance = transactions
      .filter(t => isBefore(new Date(t.date), startOfMonth(today)))
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

    const projectionInterval = {
      start: startOfMonth(today),
      end: new Date(projectionMonth),
    };

    const monthsToProject = eachMonthOfInterval(projectionInterval);
    if (monthsToProject.length === 0) return { chartData: [], finalBalance: 0 };
    
    let accumulatedBalance = initialBalance;
    let lastMonthFixedIncome = 0;
    let lastMonthFixedExpense = 0;
    
    const chartData = monthsToProject.map((monthDate) => {
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthName = format(monthDate, 'MMM', { locale: ptBR });
      
      const isCurrentMonthOrPast = !isBefore(endOfMonth(monthDate), today);
      const historicalData = monthlySummary.get(monthKey);
      
      let totalIncome, totalExpense;
      
      if (isCurrentMonthOrPast && historicalData) {
        // For current and past months, use actual variable and fixed data
        totalIncome = historicalData.income.fixed + historicalData.income.variable;
        totalExpense = historicalData.expense.fixed + historicalData.expense.variable;
        accumulatedBalance += totalIncome - totalExpense;

        // Store the fixed values of the last real month for future projections
        lastMonthFixedIncome = historicalData.income.fixed;
        lastMonthFixedExpense = historicalData.expense.fixed;
        
        return {
          month: monthName,
          receita: totalIncome,
          despesa: totalExpense,
          saldo: accumulatedBalance,
          isProjection: false,
        };
      } else { // Future months projection
        // Project using only fixed values from the last available month
        totalIncome = lastMonthFixedIncome;
        totalExpense = lastMonthFixedExpense;

        accumulatedBalance += totalIncome - totalExpense;
        
        return {
          month: monthName,
          receita: totalIncome,
          despesa: totalExpense,
          saldo: accumulatedBalance,
          isProjection: true,
        };
      }
    });

    return { chartData, finalBalance: chartData.length > 0 ? chartData[chartData.length - 1].saldo : 0 };
}, [projectionMonth, transactions, today]);


  const { chartData, finalBalance } = processedData;

  const dailyStatus = useMemo(() => {
    const monthlySummary = calculateMonthlySummary(transactions);
    const currentMonthKey = format(today, 'yyyy-MM');
    const currentMonthData = monthlySummary.get(currentMonthKey) || { income: { fixed: 0, variable: 0 }, expense: { fixed: 0, variable: 0 } };

    const todayIncome = transactions
        .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const todayExpense = transactions
        .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const endOfMonthIncome = currentMonthData.income.fixed + currentMonthData.income.variable;
    const endOfMonthExpense = currentMonthData.expense.fixed + currentMonthData.expense.variable;

    return {
      today: {
        income: todayIncome,
        expense: todayExpense,
        balance: todayIncome - todayExpense,
      },
      endOfMonth: {
        income: endOfMonthIncome,
        expense: endOfMonthExpense,
        balance: endOfMonthIncome - endOfMonthExpense,
      }
    };
  }, [transactions, today]);

  const expenseBreakdown = useMemo(() => {
    const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), today));
    const fixed = currentMonthExpenses.filter(t => t.category === 'fixed').reduce((acc, t) => acc + t.amount, 0);
    const variable = currentMonthExpenses.filter(t => t.category === 'variable').reduce((acc, t) => acc + t.amount, 0);
    const total = fixed + variable;

    if (total === 0) return [];

    return [
      { name: 'Fixa', value: fixed, fill: 'hsl(var(--chart-1))' },
      { name: 'Variável', value: variable, fill: 'hsl(var(--chart-2))' },
    ];
  }, [transactions, today]);

  const chartConfig = {
    receita: { label: "Receita", color: "hsl(var(--chart-1))" },
    despesa: { label: "Despesa", color: "hsl(var(--chart-2))" },
    saldo: { label: "Saldo", color: "hsl(var(--chart-3))" },
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
            <CardTitle className="text-sm font-medium">Projeção Final</CardTitle>
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
            <CardDescription>
                Mostra seu saldo acumulado com base em dados históricos e projeções futuras.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                <ComposedChart data={chartData}>
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
                        formatter={(value, name) => {
                            const formattedValue = currencyFormatter.format(value as number);
                            const label = chartConfig[name as keyof typeof chartConfig]?.label || name;
                            return `${label}: ${formattedValue}`;
                        }}
                    />}
                />
                <Legend />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={4} name="Receita" />
                <Bar dataKey="despesa" fill="var(--color-despesa)" radius={4} name="Despesa" />
                <Line type="monotone" dataKey="saldo" strokeWidth={2} stroke="var(--color-saldo)" dot={false} name="Saldo" />
                </ComposedChart>
            </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Distribuição de Despesas</CardTitle>
                <CardDescription>Despesas fixas vs. variáveis no mês atual.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                  {expenseBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                        <Tooltip
                            content={<ChartTooltipContent
                                formatter={(value, name) => `${name}: ${currencyFormatter.format(value as number)}`}
                                nameKey="name"
                            />}
                        />
                        <Pie
                            data={expenseBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {expenseBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Nenhuma despesa este mês.
                    </div>
                  )}
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
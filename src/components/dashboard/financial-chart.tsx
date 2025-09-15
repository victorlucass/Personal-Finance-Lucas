"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";

type Props = {
  data: Transaction[];
};

export function FinancialChart({ data }: Props) {
  const chartData = data.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleString('pt-BR', { month: 'short' });
    let monthData = acc.find(d => d.month === month);
    if (!monthData) {
      monthData = { month, income: 0, expenses: 0 };
      acc.push(monthData);
    }
    if (transaction.type === 'income') {
      monthData.income += transaction.amount;
    } else {
      monthData.expenses += transaction.amount;
    }
    return acc;
  }, [] as { month: string; income: number; expenses: number }[]);

  const chartConfig = {
    income: {
      label: "Receita",
      color: "hsl(var(--accent))",
    },
    expenses: {
      label: "Despesas",
      color: "hsl(var(--destructive))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita vs. Despesas</CardTitle>
        <CardDescription>Um resumo do seu fluxo de caixa para o mês.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
             <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `R$${value}`}
              />
            <Tooltip 
              content={<ChartTooltipContent />} 
              formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            />
            <Legend />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

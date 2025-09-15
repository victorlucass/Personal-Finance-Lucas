import { mockTransactions } from "@/lib/data";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { FinancialChart } from "@/components/dashboard/financial-chart";
import { ProjectionTool } from "@/components/dashboard/projection-tool";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
  const totalIncome = mockTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = mockTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const monthlySpendingHabits = mockTransactions
    .filter((t) => t.type === 'expense')
    .map((t) => `- ${t.description}: $${t.amount.toFixed(2)}`)
    .join('\n');

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's your financial overview.</p>
      </header>

      <FinancialOverview
        income={totalIncome}
        expenses={totalExpenses}
        balance={balance}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FinancialChart data={mockTransactions} />
        </div>
        <div>
           <RecentTransactions transactions={mockTransactions.slice(0, 5)} />
        </div>
      </div>
      
      <ProjectionTool pastSpendingHabits={monthlySpendingHabits} />

    </div>
  );
}

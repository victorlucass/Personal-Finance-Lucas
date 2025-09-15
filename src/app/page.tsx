import { FinancialProjection } from "@/components/dashboard/financial-projection";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Projeção</h1>
        <p className="text-muted-foreground">Sua visão financeira para o dia, mês e ano.</p>
      </header>

      <FinancialProjection />

    </div>
  );
}

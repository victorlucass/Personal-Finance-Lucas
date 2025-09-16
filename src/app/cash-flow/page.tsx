import { DailyCashFlow } from "@/components/cash-flow/daily-cash-flow";

export default function CashFlowPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa Diário</h1>
        <p className="text-muted-foreground">Projeção do seu saldo para os próximos dias.</p>
      </header>
      <DailyCashFlow />
    </div>
  );
}

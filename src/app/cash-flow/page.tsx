import { CashFlowCalendar } from "@/components/cash-flow/cash-flow-calendar";

export default function CashFlowPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa Diário</h1>
        <p className="text-muted-foreground">Seu saldo projetado para cada dia do mês.</p>
      </header>
      <CashFlowCalendar />
    </div>
  );
}

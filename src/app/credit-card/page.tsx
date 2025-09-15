import { StatementUploader } from "@/components/credit-card/statement-uploader";

export default function CreditCardPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Cartão de Crédito</h1>
        <p className="text-muted-foreground">Analise suas faturas de cartão de crédito com IA.</p>
      </header>

      <StatementUploader />
    </div>
  );
}

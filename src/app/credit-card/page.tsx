import { StatementUploader } from "@/components/credit-card/statement-uploader";

export default function CreditCardPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Credit Card</h1>
        <p className="text-muted-foreground">Analyze your credit card statements with AI.</p>
      </header>

      <StatementUploader />
    </div>
  );
}

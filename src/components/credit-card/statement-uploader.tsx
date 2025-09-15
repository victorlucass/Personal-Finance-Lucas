"use client";

import { useState, useRef } from "react";
import { runCreditCardAnalysis } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileWarning } from "lucide-react";
import { SpendingList } from "./spending-list";
import type { CreditCardTransaction } from "@/lib/types";

export function StatementUploader() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<CreditCardTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setTransactions(null);
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const result = await runCreditCardAnalysis({ statementDataUri: dataUri });

      if (result.success && result.data) {
        setTransactions(result.data.transactions);
      } else {
        setError(result.error || "Falha ao analisar a fatura. Por favor, tente um arquivo diferente.");
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setError("Falha ao ler o arquivo.");
      setLoading(false);
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Fatura</CardTitle>
          <CardDescription>
            Envie sua fatura do cartão de crédito (PDF) para extrair automaticamente os detalhes dos gastos. Seus dados são processados com segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              id="statement"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={loading}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
              <Upload className="mr-2 h-4 w-4" />
              Escolher Arquivo
            </Button>
            {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader className="flex-row gap-4 items-center">
             <FileWarning className="h-6 w-6 text-destructive" />
             <div>
                <CardTitle className="text-destructive">Análise Falhou</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
             </div>
          </CardHeader>
        </Card>
      )}

      {transactions && <SpendingList transactions={transactions} />}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { runEndOfYearProjection } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";

const formSchema = z.object({
  salary: z.coerce.number().min(0, "O salário deve ser um número positivo."),
  fixedExpenses: z.coerce.number().min(0, "As despesas devem ser um número positivo."),
  pastSpendingHabits: z.string().min(10, "Forneça mais detalhes sobre seus hábitos de consumo."),
});

type Props = {
  pastSpendingHabits: string;
};

export function ProjectionTool({ pastSpendingHabits }: Props) {
  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salary: 5000,
      fixedExpenses: 1375,
      pastSpendingHabits: pastSpendingHabits,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setProjection(null);
    setError(null);
    
    const result = await runEndOfYearProjection(values);

    if (result.success && result.data) {
      setProjection(result.data.projection);
    } else {
      setError(result.error || "Ocorreu um erro desconhecido.");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de Fim de Ano</CardTitle>
        <CardDescription>
          Preveja sua situação financeira até o final do ano com base em seus hábitos atuais.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário Mensal</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="fixedExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Despesas Fixas Mensais</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pastSpendingHabits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo dos Hábitos de Consumo</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ex: Supermercado: R$400, Restaurantes: R$200..." {...field} rows={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="rounded-lg border bg-muted/50 p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Sua Projeção</h3>
              {loading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Analisando seu futuro financeiro...</p>
                  </div>
                </div>
              )}
              {error && <div className="text-destructive">{error}</div>}
              {projection && (
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap flex-1 overflow-y-auto">
                    {projection}
                </div>
              )}
              {!loading && !projection && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Wand2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">Sua previsão de fim de ano aparecerá aqui.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Gerar Projeção
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

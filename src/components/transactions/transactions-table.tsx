import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const typeTranslations: Record<Transaction['type'], string> = {
    income: 'Receita',
    expense: 'Despesa',
  };

  const categoryTranslations: Record<Transaction['category'], string> = {
    fixed: 'Fixa',
    variable: 'Variável',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
        <CardDescription>Uma lista de suas receitas e despesas recentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(t.type === 'income' ? 'border-accent text-accent-foreground' : 'border-destructive/80 text-destructive')}>{typeTranslations[t.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{categoryTranslations[t.category]}</Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", t.type === 'income' ? 'text-accent-foreground' : 'text-destructive')}>
                    {t.type === 'income' ? '+' : '-'}{currencyFormatter.format(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

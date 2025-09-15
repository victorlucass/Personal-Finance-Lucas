import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Trash2 } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'})
}

type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function TransactionsTable({ transactions, onEdit, onDelete, onClearAll }: TransactionsTableProps) {
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Uma lista de suas receitas e despesas recentes.</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={transactions.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Tudo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso excluirá permanentemente todas as suas transações.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onClearAll}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Pagamento/Vencimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>{dateFormatter(t.date)}</TableCell>
                    <TableCell>{t.type === 'income' ? dateFormatter(t.paymentDate) : dateFormatter(t.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(t.type === 'income' ? 'border-accent text-accent-foreground' : 'border-destructive/80 text-destructive')}>{typeTranslations[t.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{categoryTranslations[t.category]}</Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", t.type === 'income' ? 'text-accent-foreground' : 'text-destructive')}>
                      {t.type === 'income' ? '+' : '-'}{currencyFormatter.format(t.amount)}
                    </TableCell>
                    <TableCell>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(t)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(t.id)}>Apagar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">Nenhuma transação encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

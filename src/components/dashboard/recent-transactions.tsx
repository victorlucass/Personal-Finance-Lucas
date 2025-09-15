import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, ShoppingCart } from "lucide-react";
import { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your last {transactions.length} transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div className="flex items-center" key={transaction.id}>
            <Avatar className="h-9 w-9">
              <AvatarFallback className={cn(
                transaction.type === 'income' ? 'bg-accent/20 text-accent-foreground' : 'bg-destructive/20 text-destructive'
              )}>
                {transaction.type === 'income' ? <DollarSign className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div className={cn(
              "ml-auto font-medium",
              transaction.type === 'income' ? 'text-accent-foreground' : 'text-destructive'
            )}>
              {transaction.type === 'income' ? '+' : '-'}{currencyFormatter.format(transaction.amount)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

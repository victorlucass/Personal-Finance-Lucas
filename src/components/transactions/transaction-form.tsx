"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@/lib/types";

const formSchema = z.object({
  description: z.string().min(2, "A descrição é muito curta."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  type: z.enum(["income", "expense"]),
  category: z.enum(["fixed", "variable"]),
  date: z.date(),
});

type TransactionFormProps = {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            amount: 0,
            type: "expense",
            category: "variable",
            date: new Date(),
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const transactionData = { ...values, date: values.date.toISOString() };
        onAddTransaction(transactionData);
        toast({
            title: "Transação Adicionada",
            description: `Adicionado "${values.description}" de R$${values.amount}.`,
        });
        form.reset({
            description: "",
            amount: 0,
            type: "expense",
            category: "variable",
            date: new Date(),
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Input placeholder="ex: Supermercado" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl><Input type="number" placeholder="150,75" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Transação</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("2000-01-01")
                            }
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                          <FormItem className="space-y-3">
                              <FormLabel>Tipo</FormLabel>
                              <FormControl>
                                  <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="flex space-x-2"
                                  >
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl><RadioGroupItem value="income" /></FormControl>
                                          <FormLabel className="font-normal">Receita</FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl><RadioGroupItem value="expense" /></FormControl>
                                          <FormLabel className="font-normal">Despesa</FormLabel>
                                      </FormItem>
                                  </RadioGroup>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="fixed">Fixa</SelectItem>
                                      <SelectItem value="variable">Variável</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transação
                </Button>
            </form>
        </Form>
    );
}

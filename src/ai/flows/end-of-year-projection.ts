'use server';
/**
 * @fileOverview Fornece uma previsão financeira até o final do ano com base na renda, despesas fixas e hábitos de consumo do usuário.
 *
 * - generateEndOfYearProjection - Uma função que gera a projeção de fim de ano.
 * - EndOfYearProjectionInput - O tipo de entrada para a função generateEndOfYearProjection.
 * - EndOfYearProjectionOutput - O tipo de retorno para a função generateEndOfYearProjection.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EndOfYearProjectionInputSchema = z.object({
  salary: z
    .number()
    .describe('O salário mensal do usuário.'),
  fixedExpenses: z
    .number()
    .describe('O total de despesas fixas mensais do usuário.'),
  pastSpendingHabits: z
    .string()
    .describe(
      'Um resumo detalhado dos hábitos de consumo passados do usuário, incluindo categorias e valores.'
    ),
});
export type EndOfYearProjectionInput = z.infer<typeof EndOfYearProjectionInputSchema>;

const EndOfYearProjectionOutputSchema = z.object({
  projection: z
    .string()
    .describe(
      'Uma projeção financeira detalhada até o final do ano, considerando salário, despesas fixas e hábitos de consumo.'
    ),
});
export type EndOfYearProjectionOutput = z.infer<typeof EndOfYearProjectionOutputSchema>;

export async function generateEndOfYearProjection(
  input: EndOfYearProjectionInput
): Promise<EndOfYearProjectionOutput> {
  return endOfYearProjectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'endOfYearProjectionPrompt',
  input: {schema: EndOfYearProjectionInputSchema},
  output: {schema: EndOfYearProjectionOutputSchema},
  prompt: `Você é um consultor financeiro pessoal. Gere uma projeção financeira até o final do ano para o usuário, considerando seu salário, despesas fixas e hábitos de consumo passados.

Salário: {{{salary}}}
Despesas Fixas: {{{fixedExpenses}}}
Hábitos de Consumo Passados: {{{pastSpendingHabits}}}

Forneça uma projeção detalhada, incluindo detalhamentos mensais e uma estimativa final da situação financeira do usuário no final do ano. Responda em português do Brasil.`,
});

const endOfYearProjectionFlow = ai.defineFlow(
  {
    name: 'endOfYearProjectionFlow',
    inputSchema: EndOfYearProjectionInputSchema,
    outputSchema: EndOfYearProjectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

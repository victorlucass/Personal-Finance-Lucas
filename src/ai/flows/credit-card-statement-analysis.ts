'use server';
/**
 * @fileOverview Agente de IA para análise de extrato de cartão de crédito.
 *
 * - analyzeCreditCardStatement - Uma função que lida com o processo de análise de extrato de cartão de crédito.
 * - AnalyzeCreditCardStatementInput - O tipo de entrada para a função analyzeCreditCardStatement.
 * - AnalyzeCreditCardStatementOutput - O tipo de retorno para a função analyzeCreditCardStatement.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCreditCardStatementInputSchema = z.object({
  statementDataUri: z
    .string()
    .describe(
      "Um extrato de cartão de crédito, como um URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<dados_codificados>'."
    ),
});
export type AnalyzeCreditCardStatementInput = z.infer<typeof AnalyzeCreditCardStatementInputSchema>;

const AnalyzeCreditCardStatementOutputSchema = z.object({
  transactions: z.array(
    z.object({
      storeName: z.string().describe('O nome da loja onde a transação ocorreu.'),
      amount: z.number().describe('O valor da transação.'),
      description: z.string().describe('Uma descrição da transação.'),
    })
  ).describe('Uma lista de transações extraídas do extrato do cartão de crédito.'),
});
export type AnalyzeCreditCardStatementOutput = z.infer<typeof AnalyzeCreditCardStatementOutputSchema>;

export async function analyzeCreditCardStatement(input: AnalyzeCreditCardStatementInput): Promise<AnalyzeCreditCardStatementOutput> {
  return analyzeCreditCardStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCreditCardStatementPrompt',
  input: {schema: AnalyzeCreditCardStatementInputSchema},
  output: {schema: AnalyzeCreditCardStatementOutputSchema},
  prompt: `Você é um analista financeiro especialista em análise de extratos de cartão de crédito.

Você extrairá os detalhes da transação do extrato do cartão de crédito, incluindo nome da loja, valor e descrição, e categorizará os gastos.

Analise o seguinte extrato de cartão de crédito:

{{media url=statementDataUri}}`,
});

const analyzeCreditCardStatementFlow = ai.defineFlow(
  {
    name: 'analyzeCreditCardStatementFlow',
    inputSchema: AnalyzeCreditCardStatementInputSchema,
    outputSchema: AnalyzeCreditCardStatementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

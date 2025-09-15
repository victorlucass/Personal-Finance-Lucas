'use server';
/**
 * @fileOverview Credit card statement analysis AI agent.
 *
 * - analyzeCreditCardStatement - A function that handles the credit card statement analysis process.
 * - AnalyzeCreditCardStatementInput - The input type for the analyzeCreditCardStatement function.
 * - AnalyzeCreditCardStatementOutput - The return type for the analyzeCreditCardStatement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCreditCardStatementInputSchema = z.object({
  statementDataUri: z
    .string()
    .describe(
      "A credit card statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCreditCardStatementInput = z.infer<typeof AnalyzeCreditCardStatementInputSchema>;

const AnalyzeCreditCardStatementOutputSchema = z.object({
  transactions: z.array(
    z.object({
      storeName: z.string().describe('The name of the store where the transaction occurred.'),
      amount: z.number().describe('The amount of the transaction.'),
      description: z.string().describe('A description of the transaction.'),
    })
  ).describe('A list of transactions extracted from the credit card statement.'),
});
export type AnalyzeCreditCardStatementOutput = z.infer<typeof AnalyzeCreditCardStatementOutputSchema>;

export async function analyzeCreditCardStatement(input: AnalyzeCreditCardStatementInput): Promise<AnalyzeCreditCardStatementOutput> {
  return analyzeCreditCardStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCreditCardStatementPrompt',
  input: {schema: AnalyzeCreditCardStatementInputSchema},
  output: {schema: AnalyzeCreditCardStatementOutputSchema},
  prompt: `You are an expert financial analyst specializing in credit card statement analysis.

You will extract transaction details from the credit card statement, including store name, amount, and description, and categorize the spending.

Analyze the following credit card statement:

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

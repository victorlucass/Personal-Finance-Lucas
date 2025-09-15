'use server';
/**
 * @fileOverview Provides a financial forecast up to the end of the year based on the user's income, fixed expenses, and spending habits.
 *
 * - generateEndOfYearProjection - A function that generates the end of year projection.
 * - EndOfYearProjectionInput - The input type for the generateEndOfYearProjection function.
 * - EndOfYearProjectionOutput - The return type for the generateEndOfYearProjection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EndOfYearProjectionInputSchema = z.object({
  salary: z
    .number()
    .describe('The users monthly salary.'),
  fixedExpenses: z
    .number()
    .describe('The users total monthly fixed expenses.'),
  pastSpendingHabits: z
    .string()
    .describe(
      'A detailed summary of the user past spending habits, including categories and amounts.'
    ),
});
export type EndOfYearProjectionInput = z.infer<typeof EndOfYearProjectionInputSchema>;

const EndOfYearProjectionOutputSchema = z.object({
  projection: z
    .string()
    .describe(
      'A detailed financial projection until the end of the year, considering salary, fixed expenses, and spending habits.'
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
  prompt: `You are a personal finance advisor. Generate a financial projection until the end of the year for the user, considering their salary, fixed expenses, and past spending habits.

Salary: {{{salary}}}
Fixed Expenses: {{{fixedExpenses}}}
Past Spending Habits: {{{pastSpendingHabits}}}

Provide a detailed projection, including monthly breakdowns and a final estimate of the user\'s financial situation at the end of the year.`,
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

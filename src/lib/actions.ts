"use server";

import { generateEndOfYearProjection } from "@/ai/flows/end-of-year-projection";
import { analyzeCreditCardStatement } from "@/ai/flows/credit-card-statement-analysis";
import type { EndOfYearProjectionInput } from "@/ai/flows/end-of-year-projection";
import type { AnalyzeCreditCardStatementInput } from "@/ai/flows/credit-card-statement-analysis";

export async function runEndOfYearProjection(input: EndOfYearProjectionInput) {
  try {
    const result = await generateEndOfYearProjection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Falha ao gerar projeção." };
  }
}

export async function runCreditCardAnalysis(input: AnalyzeCreditCardStatementInput) {
  try {
    const result = await analyzeCreditCardStatement(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Falha ao analisar a fatura." };
  }
}

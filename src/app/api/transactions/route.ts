import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';

export async function GET() {
  try {
    const transactions = dataStore.getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newTransaction = dataStore.addTransaction(body);
        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to add transaction' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        dataStore.clearAllTransactions();
        return NextResponse.json({ message: 'All transactions cleared' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to clear transactions' }, { status: 500 });
    }
}

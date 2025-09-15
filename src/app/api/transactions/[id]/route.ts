import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';

type Params = {
  params: {
    id: string;
  }
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const body = await request.json();
        const updatedTransaction = dataStore.updateTransaction({ ...body, id: params.id });
        return NextResponse.json(updatedTransaction, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update transaction' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        dataStore.deleteTransaction(params.id);
        return new Response(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
    }
}

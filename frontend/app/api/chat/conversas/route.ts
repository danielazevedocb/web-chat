import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const status = searchParams.get('status');
    const prioridade = searchParams.get('prioridade');
    const canal = searchParams.get('canal');
    const search = searchParams.get('search');

    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 },
      );
    }

    const queryParams = new URLSearchParams();
    if (empresaId) queryParams.append('empresaId', empresaId);
    if (status) queryParams.append('status', status);
    if (prioridade) queryParams.append('prioridade', prioridade);
    if (canal) queryParams.append('canal', canal);
    if (search) queryParams.append('search', search);

    const response = await fetch(`${API_URL}/chat/conversas?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar conversas');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de conversas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 },
      );
    }

    const response = await fetch(`${API_URL}/chat/conversas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar conversa');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de conversas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

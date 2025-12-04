import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/servers - List all servers
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const servers = await prisma.server.findMany({
      include: {
        _count: {
          select: { tools: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

// POST /api/servers - Create a new server
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, command, baseUrl, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'mcp' && type !== 'http') {
      return NextResponse.json(
        { error: 'Type must be "mcp" or "http"' },
        { status: 400 }
      );
    }

    const server = await prisma.server.create({
      data: {
        name,
        type,
        command: command || null,
        baseUrl: baseUrl || null,
        description: description || null,
      },
    });

    return NextResponse.json({ server }, { status: 201 });
  } catch (error) {
    console.error('Error creating server:', error);
    return NextResponse.json(
      { error: 'Failed to create server' },
      { status: 500 }
    );
  }
}

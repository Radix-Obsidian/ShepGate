import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/tools - List all tools (optionally filtered by serverId)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');

    const tools = await prisma.tool.findMany({
      where: serverId ? { serverId } : undefined,
      include: {
        server: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST /api/tools - Create a tool manually
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serverId, name, description, inputSchema, riskLevel } = body;

    if (!serverId || !name) {
      return NextResponse.json(
        { error: 'Server ID and name are required' },
        { status: 400 }
      );
    }

    // Check if server exists
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    const tool = await prisma.tool.create({
      data: {
        serverId,
        name,
        description: description || null,
        inputSchema: inputSchema || null,
        riskLevel: riskLevel || 'needs_approval',
      },
    });

    return NextResponse.json({ tool }, { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}

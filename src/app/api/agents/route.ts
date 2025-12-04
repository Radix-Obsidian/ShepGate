import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/agents - List all agent profiles
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await prisma.agentProfile.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            toolPermissions: true,
          },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent profile
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, hostType, apiKey } = await request.json();

    if (!name || !hostType) {
      return NextResponse.json(
        { error: 'Name and host type are required' },
        { status: 400 }
      );
    }

    const agent = await prisma.agentProfile.create({
      data: {
        name,
        description,
        hostType,
        apiKey,
      },
    });

    // Backfill permissions for all existing tools
    const allTools = await prisma.tool.findMany({
      select: { id: true },
    });

    if (allTools.length > 0) {
      const permissionsToCreate = allTools.map(tool => ({
        agentProfileId: agent.id,
        toolId: tool.id,
        allowed: false, // Default to blocked for safety
      }));

      await prisma.toolPermission.createMany({
        data: permissionsToCreate,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

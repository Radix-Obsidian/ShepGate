import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/activity - List all action logs
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actionLogs = await prisma.actionLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        agentProfile: {
          select: {
            id: true,
            name: true,
            hostType: true,
          },
        },
        tool: {
          include: {
            server: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ actionLogs });
  } catch (error) {
    console.error('Failed to fetch action logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action logs' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { PolicyEngine } from '@/lib/policy';

// GET /api/approvals - List all pending actions
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingActions = await prisma.pendingAction.findMany({
      where: { status: 'pending' },
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

    return NextResponse.json({ pendingActions });
  } catch (error) {
    console.error('Failed to fetch pending actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending actions' },
      { status: 500 }
    );
  }
}

// POST /api/approvals/batch-approve - Approve multiple pending actions
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { actionIds } = await request.json();

    if (!Array.isArray(actionIds) || actionIds.length === 0) {
      return NextResponse.json(
        { error: 'actionIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Process approvals in parallel
    const results = await Promise.allSettled(
      actionIds.map(id => PolicyEngine.approveAction(id))
    );

    const approved = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      message: `Processed ${actionIds.length} actions: ${approved} approved, ${failed} failed`,
      approved,
      failed,
    });
  } catch (error) {
    console.error('Failed to batch approve:', error);
    return NextResponse.json(
      { error: 'Failed to batch approve actions' },
      { status: 500 }
    );
  }
}

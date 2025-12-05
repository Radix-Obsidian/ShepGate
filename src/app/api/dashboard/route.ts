import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get counts from database
    const [serverCount, agentCount, pendingCount, todayActionsCount] = await Promise.all([
      prisma.server.count(),
      prisma.agentProfile.count(),
      prisma.pendingAction.count({
        where: { status: 'pending' }
      }),
      prisma.actionLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
          }
        }
      })
    ]);

    return NextResponse.json({
      servers: serverCount,
      agents: agentCount,
      pending: pendingCount,
      actions: todayActionsCount
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

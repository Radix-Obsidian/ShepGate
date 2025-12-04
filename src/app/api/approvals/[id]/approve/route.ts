import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PolicyEngine } from '@/lib/policy';

// POST /api/approvals/[id]/approve - Approve a specific pending action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await PolicyEngine.approveAction(id);

    return NextResponse.json({
      message: 'Action approved successfully',
      actionId: id,
    });
  } catch (error) {
    console.error('Failed to approve action:', error);
    return NextResponse.json(
      { error: 'Failed to approve action' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PolicyEngine } from '@/lib/policy';

// POST /api/approvals/[id]/deny - Deny a specific pending action
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

    await PolicyEngine.denyAction(id);

    return NextResponse.json({
      message: 'Action denied successfully',
      actionId: id,
    });
  } catch (error) {
    console.error('Failed to deny action:', error);
    return NextResponse.json(
      { error: 'Failed to deny action' },
      { status: 500 }
    );
  }
}

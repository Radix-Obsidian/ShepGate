import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// PATCH /api/agents/[id]/permissions/[permissionId] - Update a tool permission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; permissionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, permissionId } = await params;
    const { allowed } = await request.json();

    if (typeof allowed !== 'boolean') {
      return NextResponse.json(
        { error: 'allowed must be a boolean' },
        { status: 400 }
      );
    }

    // Verify the permission belongs to this agent
    const permission = await prisma.toolPermission.findFirst({
      where: {
        id: permissionId,
        agentProfileId: id,
      },
    });

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }

    const updatedPermission = await prisma.toolPermission.update({
      where: { id: permissionId },
      data: { allowed },
    });

    return NextResponse.json({ permission: updatedPermission });
  } catch (error) {
    console.error('Failed to update permission:', error);
    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 }
    );
  }
}

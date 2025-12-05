import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Update all permissions for this agent to not allowed
    await prisma.toolPermission.updateMany({
      where: { agentProfileId: id },
      data: { allowed: false }
    });

    return NextResponse.json({ success: true, message: 'All permissions revoked' });
  } catch (error) {
    console.error('Failed to revoke all permissions:', error);
    return NextResponse.json(
      { error: 'Failed to revoke all permissions' },
      { status: 500 }
    );
  }
}

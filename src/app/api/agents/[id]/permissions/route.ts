import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/agents/[id]/permissions/grant-all - Grant all tool permissions for an agent
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

    // Get all tools to create/update permissions
    const allTools = await prisma.tool.findMany({
      select: { id: true },
    });

    if (allTools.length === 0) {
      return NextResponse.json({ message: 'No tools found to grant permissions for' });
    }

    // Create or update permissions for all tools
    const permissionUpdates = allTools.map(tool => ({
      agentProfileId: id,
      toolId: tool.id,
      allowed: true,
    }));

    // Use upsert to handle both creating new permissions and updating existing ones
    const results = await Promise.all(
      permissionUpdates.map(update =>
        prisma.toolPermission.upsert({
          where: {
            agentProfileId_toolId: {
              agentProfileId: update.agentProfileId,
              toolId: update.toolId,
            },
          },
          update: { allowed: true },
          create: update,
        })
      )
    );

    return NextResponse.json({
      message: `Granted permissions for ${results.length} tools`,
      permissions: results,
    });
  } catch (error) {
    console.error('Failed to grant all permissions:', error);
    return NextResponse.json(
      { error: 'Failed to grant all permissions' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]/permissions/revoke-all - Revoke all tool permissions for an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await prisma.toolPermission.updateMany({
      where: { agentProfileId: id },
      data: { allowed: false },
    });

    return NextResponse.json({
      message: `Revoked permissions for ${result.count} tools`,
      revokedCount: result.count,
    });
  } catch (error) {
    console.error('Failed to revoke all permissions:', error);
    return NextResponse.json(
      { error: 'Failed to revoke all permissions' },
      { status: 500 }
    );
  }
}

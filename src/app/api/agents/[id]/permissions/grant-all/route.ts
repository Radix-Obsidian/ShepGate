import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all tools
    const allTools = await prisma.tool.findMany({
      select: { id: true }
    });

    // Update or create permissions for all tools
    for (const tool of allTools) {
      await prisma.toolPermission.upsert({
        where: {
          agentProfileId_toolId: {
            agentProfileId: id,
            toolId: tool.id
          }
        },
        update: { allowed: true },
        create: {
          agentProfileId: id,
          toolId: tool.id,
          allowed: true
        }
      });
    }

    return NextResponse.json({ success: true, message: 'All permissions granted' });
  } catch (error) {
    console.error('Failed to grant all permissions:', error);
    return NextResponse.json(
      { error: 'Failed to grant all permissions' },
      { status: 500 }
    );
  }
}

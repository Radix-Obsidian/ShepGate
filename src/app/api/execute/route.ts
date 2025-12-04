import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { PolicyEngine } from '@/lib/policy';

// POST /api/execute - Execute a tool with policy evaluation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentProfileId, toolId, arguments: args } = await request.json();

    if (!agentProfileId || !toolId) {
      return NextResponse.json(
        { error: 'agentProfileId and toolId are required' },
        { status: 400 }
      );
    }

    // Validate that the agent exists
    const agent = await prisma.agentProfile.findUnique({
      where: { id: agentProfileId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Convert arguments to JSON string
    const argumentsJson = JSON.stringify(args || {});

    // Evaluate execution request through policy engine
    const policyResult = await PolicyEngine.evaluateExecution({
      agentProfileId,
      toolId,
      argumentsJson,
    });

    // Return the policy evaluation result
    return NextResponse.json({
      success: true,
      policyResult,
    });
  } catch (error) {
    console.error('Failed to execute tool:', error);
    return NextResponse.json(
      { error: 'Failed to execute tool' },
      { status: 500 }
    );
  }
}

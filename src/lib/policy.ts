import { prisma } from '@/lib/db';

export interface ExecutionRequest {
  agentProfileId: string;
  toolId: string;
  argumentsJson: string;
}

export interface PolicyResult {
  allowed: boolean;
  reason: 'allowed' | 'needs_approval' | 'blocked_risk' | 'blocked_permission';
  pendingActionId?: string;
  actionLogId?: string;
}

export class PolicyEngine {
  /**
   * Evaluate if a tool execution request should be allowed, requires approval, or is blocked
   */
  static async evaluateExecution(request: ExecutionRequest): Promise<PolicyResult> {
    try {
      // Get tool with risk level and server info
      const tool = await prisma.tool.findUnique({
        where: { id: request.toolId },
        include: {
          server: true,
        },
      });

      if (!tool) {
        throw new Error('Tool not found');
      }

      // Get agent permission for this tool
      const permission = await prisma.toolPermission.findUnique({
        where: {
          agentProfileId_toolId: {
            agentProfileId: request.agentProfileId,
            toolId: request.toolId,
          },
        },
      });

      // Rule 1: Blocked risk level always denies regardless of permission
      if (tool.riskLevel === 'blocked') {
        const actionLog = await this.createActionLog(request, 'denied', 'blocked_risk');
        return {
          allowed: false,
          reason: 'blocked_risk',
          actionLogId: actionLog.id,
        };
      }

      // Rule 2: If no permission exists or permission is explicitly denied, block execution
      if (!permission || !permission.allowed) {
        const actionLog = await this.createActionLog(request, 'denied', 'blocked_permission');
        return {
          allowed: false,
          reason: 'blocked_permission',
          actionLogId: actionLog.id,
        };
      }

      // Rule 3: Safe tools with allowed permission can execute immediately
      if (tool.riskLevel === 'safe') {
        const actionLog = await this.createActionLog(request, 'executed', 'allowed');
        return {
          allowed: true,
          reason: 'allowed',
          actionLogId: actionLog.id,
        };
      }

      // Rule 4: Tools that need approval create a pending action
      if (tool.riskLevel === 'needs_approval') {
        const pendingAction = await this.createPendingAction(request);
        return {
          allowed: false,
          reason: 'needs_approval',
          pendingActionId: pendingAction.id,
        };
      }

      // Fallback: Default to deny for unknown risk levels
      const actionLog = await this.createActionLog(request, 'denied', 'unknown_risk');
      return {
        allowed: false,
        reason: 'blocked_risk',
        actionLogId: actionLog.id,
      };
    } catch (error) {
      console.error('Policy evaluation error:', error);
      throw new Error('Failed to evaluate execution request');
    }
  }

  /**
   * Create an action log for immediate execution or denial
   */
  private static async createActionLog(
    request: ExecutionRequest,
    status: 'executed' | 'denied',
    reason: string
  ) {
    return await prisma.actionLog.create({
      data: {
        agentProfileId: request.agentProfileId,
        toolId: request.toolId,
        argumentsJson: request.argumentsJson,
        status,
        reason,
      },
    });
  }

  /**
   * Create a pending action for approval workflow
   */
  private static async createPendingAction(request: ExecutionRequest) {
    return await prisma.pendingAction.create({
      data: {
        agentProfileId: request.agentProfileId,
        toolId: request.toolId,
        argumentsJson: request.argumentsJson,
        status: 'pending',
      },
    });
  }

  /**
   * Approve a pending action and execute it
   */
  static async approveAction(pendingActionId: string): Promise<void> {
    const pendingAction = await prisma.pendingAction.findUnique({
      where: { id: pendingActionId },
      include: {
        tool: true,
      },
    });

    if (!pendingAction) {
      throw new Error('Pending action not found');
    }

    // Update pending action status
    await prisma.pendingAction.update({
      where: { id: pendingActionId },
      data: { status: 'approved' },
    });

    // Create action log for the approved execution
    await prisma.actionLog.create({
      data: {
        agentProfileId: pendingAction.agentProfileId,
        toolId: pendingAction.toolId,
        argumentsJson: pendingAction.argumentsJson,
        status: 'executed',
        reason: 'approved',
      },
    });

    // TODO: Actually execute the tool here (Phase 5)
    console.log(`Tool ${pendingAction.tool.name} would be executed with arguments:`, pendingAction.argumentsJson);
  }

  /**
   * Deny a pending action
   */
  static async denyAction(pendingActionId: string): Promise<void> {
    const pendingAction = await prisma.pendingAction.findUnique({
      where: { id: pendingActionId },
    });

    if (!pendingAction) {
      throw new Error('Pending action not found');
    }

    // Update pending action status
    await prisma.pendingAction.update({
      where: { id: pendingActionId },
      data: { status: 'denied' },
    });

    // Create action log for the denied execution
    await prisma.actionLog.create({
      data: {
        agentProfileId: pendingAction.agentProfileId,
        toolId: pendingAction.toolId,
        argumentsJson: pendingAction.argumentsJson,
        status: 'denied',
        reason: 'denied_by_user',
      },
    });
  }
}

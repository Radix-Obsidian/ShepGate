'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';

interface PendingAction {
  id: string;
  argumentsJson: string;
  status: string;
  createdAt: string;
  agentProfile: {
    id: string;
    name: string;
    hostType: string;
  };
  tool: {
    id: string;
    name: string;
    description: string | null;
    riskLevel: string;
    server: {
      id: string;
      name: string;
      type: string;
    };
  };
}

export default function ApprovalsPage() {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string[]>([]);

  const fetchPendingActions = async () => {
    try {
      const response = await fetch('/api/approvals');
      if (response.ok) {
        const data = await response.json();
        setPendingActions(data.pendingActions);
      }
    } catch (error) {
      console.error('Failed to fetch pending actions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingActions();
  }, []);

  const handleApprove = async (actionId: string) => {
    setProcessing(prev => [...prev, actionId]);
    try {
      const response = await fetch(`/api/approvals/${actionId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchPendingActions();
      }
    } catch (error) {
      console.error('Failed to approve action:', error);
    } finally {
      setProcessing(prev => prev.filter(id => id !== actionId));
    }
  };

  const handleDeny = async (actionId: string) => {
    setProcessing(prev => [...prev, actionId]);
    try {
      const response = await fetch(`/api/approvals/${actionId}/deny`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchPendingActions();
      }
    } catch (error) {
      console.error('Failed to deny action:', error);
    } finally {
      setProcessing(prev => prev.filter(id => id !== actionId));
    }
  };

  const formatArguments = (argumentsJson: string) => {
    try {
      const parsed = JSON.parse(argumentsJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return argumentsJson;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'safe':
        return 'bg-green-900/50 text-green-300';
      case 'needs_approval':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'blocked':
        return 'bg-red-900/50 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getHostTypeBadge = (hostType: string) => {
    switch (hostType) {
      case 'claude-desktop':
        return 'bg-orange-900/50 text-orange-300';
      case 'windsurf-cascade':
        return 'bg-blue-900/50 text-blue-300';
      case 'custom':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-purple-900/50 text-purple-300';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Approvals">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Loading pending approvals...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Approvals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
            <p className="text-gray-400 mt-1">Review and approve risky actions requested by AI agents</p>
          </div>
          <button
            onClick={fetchPendingActions}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Pending actions list */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {pendingActions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">All clear!</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                No pending approvals. When an AI agent requests a risky action, it will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {pendingActions.map((action) => (
                <div key={action.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-mono bg-purple-900/50 text-purple-300">
                          {action.tool.name}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getRiskLevelBadge(action.tool.riskLevel)}`}>
                          {action.tool.riskLevel.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {getTimeAgo(action.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Agent: <span className="text-white font-medium">{action.agentProfile.name}</span></span>
                        <span className={`px-2 py-1 rounded text-xs ${getHostTypeBadge(action.agentProfile.hostType)}`}>
                          {action.agentProfile.hostType}
                        </span>
                        <span>Server: <span className="text-white">{action.tool.server.name}</span></span>
                      </div>
                      {action.tool.description && (
                        <p className="text-gray-500 text-sm mt-2">{action.tool.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(action.id)}
                        disabled={processing.includes(action.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {processing.includes(action.id) ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeny(action.id)}
                        disabled={processing.includes(action.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {processing.includes(action.id) ? 'Processing...' : 'Deny'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Arguments display */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Arguments:</h4>
                    <pre className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                      {formatArguments(action.argumentsJson)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h4 className="text-white font-medium mb-4">How Approvals Work</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center text-sm font-medium shrink-0">1</div>
              <div>
                <p className="text-white text-sm font-medium">Agent requests action</p>
                <p className="text-gray-500 text-xs mt-1">AI calls a tool marked as "needs approval"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-900/50 text-yellow-400 flex items-center justify-center text-sm font-medium shrink-0">2</div>
              <div>
                <p className="text-white text-sm font-medium">Review here</p>
                <p className="text-gray-500 text-xs mt-1">See the tool, arguments, and agent details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-900/50 text-green-400 flex items-center justify-center text-sm font-medium shrink-0">3</div>
              <div>
                <p className="text-white text-sm font-medium">Approve or deny</p>
                <p className="text-gray-500 text-xs mt-1">Action executes only after your approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

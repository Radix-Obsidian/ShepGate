'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';

interface ActionLog {
  id: string;
  argumentsJson: string;
  status: string;
  resultSummary: string;
  createdAt: string;
  agentProfile: {
    id: string;
    name: string;
    hostType: string;
  } | null;
  tool: {
    id: string;
    name: string;
    riskLevel: string;
    server: {
      id: string;
      name: string;
      type: string;
    };
  } | null;
}

export default function ActivityPage() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const fetchActionLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await fetch('/api/activity');
      if (response.ok) {
        const data = await response.json();
        setActionLogs(data.actionLogs);
      }
    } catch (error) {
      console.error('Failed to fetch action logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActionLogs();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => fetchActionLogs(), 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatArguments = (argumentsJson: string) => {
    try {
      const parsed = JSON.parse(argumentsJson);
      // Check if empty object or null
      if (!parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0)) {
        return '(no arguments)';
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return argumentsJson || '(no arguments)';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-900/50 text-green-300';
      case 'denied':
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
      <DashboardLayout title="Activity">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Loading activity logs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Activity">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Activity Log</h2>
            <p className="text-gray-400 mt-1">Track all AI agent actions and tool calls</p>
          </div>
          <button
            onClick={() => fetchActionLogs(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Refreshing...
              </>
            ) : 'Refresh'}
          </button>
        </div>

        {/* Activity logs list */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {actionLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                When AI agents call tools through ShepGate, all actions will be logged here with full details.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {actionLogs.map((log) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-mono bg-purple-900/50 text-purple-300`}>
                          {log.tool?.name || 'Unknown Tool'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {getTimeAgo(log.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Agent: <span className="text-white font-medium">{log.agentProfile?.name || 'Unknown'}</span></span>
                        {log.agentProfile?.hostType && (
                          <span className={`px-2 py-1 rounded text-xs ${getHostTypeBadge(log.agentProfile.hostType)}`}>
                            {log.agentProfile.hostType}
                          </span>
                        )}
                        <span>Server: <span className="text-white">{log.tool?.server.name || 'Unknown'}</span></span>
                        <span>Reason: <span className="text-white">{log.resultSummary}</span></span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpanded(log.id)}
                      className="ml-4 text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedLogs.has(log.id) ? 'Hide' : 'Show'} Arguments
                    </button>
                  </div>
                  
                  {/* Arguments display */}
                  {expandedLogs.has(log.id) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Arguments:</h4>
                      {formatArguments(log.argumentsJson) === '(no arguments)' ? (
                        <p className="text-gray-500 text-sm italic">No arguments provided for this tool call</p>
                      ) : (
                        <pre className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                          {formatArguments(log.argumentsJson)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h4 className="text-white font-medium mb-4">Status Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gray-400 text-sm">Executed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-gray-400 text-sm">Denied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-gray-400 text-sm">Blocked Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-400 text-sm">Approved</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string | null;
  riskLevel: string;
  server: {
    id: string;
    name: string;
    type: string;
  };
}

interface ToolPermission {
  id: string;
  allowed: boolean;
  tool: Tool;
}

interface Agent {
  id: string;
  name: string;
  description: string | null;
  hostType: string;
  apiKey: string | null;
  createdAt: string;
  toolPermissions: ToolPermission[];
  _count: {
    toolPermissions: number;
    pendingActions: number;
    actionLogs: number;
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    hostType: '',
    apiKey: '',
  });

  const fetchAgent = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data.agent);
        setEditForm({
          name: data.agent.name,
          description: data.agent.description || '',
          hostType: data.agent.hostType,
          apiKey: data.agent.apiKey || '',
        });
      } else if (response.status === 404) {
        router.push('/agents');
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/agents/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        fetchAgent();
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent profile? This will remove all associated permissions and history.')) return;

    try {
      const response = await fetch(`/api/agents/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/agents');
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const togglePermission = async (permissionId: string, allowed: boolean) => {
    try {
      const response = await fetch(`/api/agents/${params.id}/permissions/${permissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowed }),
      });

      if (response.ok) {
        fetchAgent();
      }
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  const grantAllPermissions = async () => {
    if (!confirm('Are you sure you want to grant permissions for ALL tools to this agent? This may allow access to risky operations.')) return;

    try {
      const response = await fetch(`/api/agents/${params.id}/permissions/grant-all`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchAgent();
      }
    } catch (error) {
      console.error('Failed to grant all permissions:', error);
    }
  };

  const revokeAllPermissions = async () => {
    if (!confirm('Are you sure you want to revoke all tool permissions for this agent?')) return;

    try {
      const response = await fetch(`/api/agents/${params.id}/permissions/revoke-all`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAgent();
      }
    } catch (error) {
      console.error('Failed to revoke all permissions:', error);
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

  if (loading) {
    return (
      <DashboardLayout title="Agent Profile">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Loading agent profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout title="Agent Profile">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Agent not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agent Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/agents"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Agents
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
              <p className="text-gray-400 mt-1">Manage agent permissions and settings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Agent Info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Agent Details</h3>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Host Type</label>
                <select
                  value={editForm.hostType}
                  onChange={(e) => setEditForm(prev => ({ ...prev, hostType: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="claude-desktop">Claude Desktop</option>
                  <option value="windsurf-cascade">Windsurf Cascade</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                <input
                  type="password"
                  value={editForm.apiKey}
                  onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional API key"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-400">Name</dt>
                <dd className="text-white mt-1">{agent.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Host Type</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${getHostTypeBadge(agent.hostType)}`}>
                    {agent.hostType}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Description</dt>
                <dd className="text-white mt-1">{agent.description || 'No description'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">API Key</dt>
                <dd className="text-white mt-1">{agent.apiKey ? '••••••••' : 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Created</dt>
                <dd className="text-white mt-1">{new Date(agent.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Statistics</dt>
                <dd className="text-white mt-1">
                  {agent._count.toolPermissions} permissions • {agent._count.pendingActions} pending • {agent._count.actionLogs} actions
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Tool Permissions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Tool Permissions ({agent.toolPermissions.length})</h3>
            {agent.toolPermissions.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={grantAllPermissions}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Grant All
                </button>
                <button
                  onClick={revokeAllPermissions}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Revoke All
                </button>
              </div>
            )}
          </div>

          {agent.toolPermissions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No tool permissions configured.</p>
              <p className="text-gray-500 text-sm">
                Tool permissions will appear here once tools are synced from servers.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tool</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Server</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {agent.toolPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium font-mono text-sm">{permission.tool.name}</p>
                        {permission.tool.description && (
                          <p className="text-gray-500 text-sm">{permission.tool.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">{permission.tool.server.name}</p>
                        <p className="text-gray-500 text-xs">{permission.tool.server.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRiskLevelBadge(permission.tool.riskLevel)}`}>
                        {permission.tool.riskLevel.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePermission(permission.id, !permission.allowed)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          permission.allowed
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {permission.allowed ? 'Allowed' : 'Blocked'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

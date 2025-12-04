'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { AddAgentModal } from '@/components/agents/AddAgentModal';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  hostType: string;
  apiKey: string | null;
  createdAt: string;
  _count: {
    toolPermissions: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

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
      <DashboardLayout title="Agent Profiles">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Loading agent profiles...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agent Profiles">
      <div className="space-y-6">
        {/* Header with action */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Agent Profiles</h2>
            <p className="text-gray-400 mt-1">Manage AI agent access and permissions</p>
          </div>
          <button
            onClick={() => setIsAddAgentOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Profile
          </button>
        </div>

        {/* Agent list */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No agent profiles configured yet.</p>
              <p className="text-gray-500 text-sm mb-6">
                Create your first agent profile to start managing tool permissions.
              </p>
              <button
                onClick={() => setIsAddAgentOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Agent Profile
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Host Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tools</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{agent.name}</p>
                        {agent.description && (
                          <p className="text-gray-500 text-sm">{agent.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getHostTypeBadge(agent.hostType)}`}>
                        {agent.hostType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {agent._count.toolPermissions} tools
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm mr-4"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h4 className="text-white font-medium mb-2">About Agent Profiles</h4>
          <p className="text-gray-400 text-sm">
            Agent profiles define what tools each AI agent can access. Create different profiles for different use cases - 
            for example, a "Read Only" profile for queries and a "Full Access" profile for operations.
          </p>
        </div>
      </div>

      <AddAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
        onSuccess={fetchAgents}
      />
    </DashboardLayout>
  );
}

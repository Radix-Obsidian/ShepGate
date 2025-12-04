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
  createdAt: string;
}

interface Server {
  id: string;
  name: string;
  type: string;
  command: string | null;
  baseUrl: string | null;
  description: string | null;
  createdAt: string;
  tools: Tool[];
}

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    command: '',
    baseUrl: '',
  });

  const fetchServer = useCallback(async () => {
    try {
      const response = await fetch(`/api/servers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setServer(data.server);
        setEditForm({
          name: data.server.name,
          description: data.server.description || '',
          command: data.server.command || '',
          baseUrl: data.server.baseUrl || '',
        });
      } else if (response.status === 404) {
        router.push('/servers');
      }
    } catch (error) {
      console.error('Failed to fetch server:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchServer();
  }, [fetchServer]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/servers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        fetchServer();
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update server:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this server? This will also delete all associated tools.')) return;

    try {
      const response = await fetch(`/api/servers/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/servers');
      }
    } catch (error) {
      console.error('Failed to delete server:', error);
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
      <DashboardLayout title="Server">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Loading server...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!server) {
    return (
      <DashboardLayout title="Server">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">Server not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={server.name}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/servers" className="text-gray-400 hover:text-white">
            Servers
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white">{server.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{server.name}</h2>
              <span className={`px-2 py-1 rounded text-xs ${
                server.type === 'mcp' 
                  ? 'bg-purple-900/50 text-purple-300' 
                  : 'bg-green-900/50 text-green-300'
              }`}>
                {server.type.toUpperCase()}
              </span>
            </div>
            {server.description && (
              <p className="text-gray-400 mt-1">{server.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
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

        {/* Edit Form */}
        {editing && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Edit Server</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>
              {server.type === 'mcp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Command</label>
                  <input
                    type="text"
                    value={editForm.command}
                    onChange={(e) => setEditForm({ ...editForm, command: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {server.type === 'http' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Base URL</label>
                  <input
                    type="url"
                    value={editForm.baseUrl}
                    onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Server Info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Connection Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-400">Type</dt>
              <dd className="text-white mt-1">{server.type === 'mcp' ? 'MCP Server' : 'HTTP API'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">
                {server.type === 'mcp' ? 'Command' : 'Base URL'}
              </dt>
              <dd className="text-white mt-1 font-mono text-sm">
                {server.type === 'mcp' ? server.command || 'Not set' : server.baseUrl || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">Created</dt>
              <dd className="text-white mt-1">{new Date(server.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">Tools</dt>
              <dd className="text-white mt-1">{server.tools.length} registered</dd>
            </div>
          </dl>
        </div>

        {/* Tools Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Tools</h3>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Sync Tools
            </button>
          </div>

          {server.tools.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No tools registered for this server yet.</p>
              <p className="text-gray-500 text-sm">
                Click &quot;Sync Tools&quot; to discover available tools from this server.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {server.tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-white font-medium">{tool.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRiskLevelBadge(tool.riskLevel)}`}>
                        {tool.riskLevel.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {tool.description || 'No description'}
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

'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import { AddServerModal } from '@/components/servers/AddServerModal';
import Link from 'next/link';

interface Server {
  id: string;
  name: string;
  type: string;
  command: string | null;
  baseUrl: string | null;
  description: string | null;
  createdAt: string;
  _count: {
    tools: number;
  };
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServers = useCallback(async () => {
    try {
      const response = await fetch('/api/servers');
      const data = await response.json();
      if (response.ok) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return;

    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchServers();
      }
    } catch (error) {
      console.error('Failed to delete server:', error);
    }
  };

  return (
    <DashboardLayout title="Servers">
      <div className="space-y-6">
        {/* Header with action */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Servers & Tools</h2>
            <p className="text-gray-400 mt-1">Connect MCP servers and HTTP APIs</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Server
          </button>
        </div>

        {loading ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400">Loading servers...</p>
          </div>
        ) : servers.length === 0 ? (
          /* Empty state */
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No servers connected</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Add your first server to start managing tools. You can connect MCP servers or wrap HTTP APIs.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Your First Server
            </button>
          </div>
        ) : (
          /* Server list */
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tools</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Connection</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/servers/${server.id}`} className="text-white font-medium hover:text-blue-400">
                          {server.name}
                        </Link>
                        {server.description && (
                          <p className="text-gray-500 text-sm truncate max-w-xs">{server.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        server.type === 'mcp' 
                          ? 'bg-purple-900/50 text-purple-300' 
                          : 'bg-green-900/50 text-green-300'
                      }`}>
                        {server.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {server._count.tools} tools
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm truncate max-w-xs">
                      {server.type === 'mcp' ? server.command : server.baseUrl}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/servers/${server.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(server.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h4 className="text-white font-medium mb-2">MCP Servers</h4>
            <p className="text-gray-400 text-sm">
              Connect Model Context Protocol servers like GitHub, Filesystem, or Postgres MCP servers.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h4 className="text-white font-medium mb-2">HTTP APIs</h4>
            <p className="text-gray-400 text-sm">
              Wrap any REST API as tools. Define endpoints and ShepGate will expose them to your agents.
            </p>
          </div>
        </div>
      </div>

      <AddServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchServers}
      />
    </DashboardLayout>
  );
}

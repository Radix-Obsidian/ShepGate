'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddServerModal({ isOpen, onClose, onSuccess }: AddServerModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'mcp' | 'http'>('mcp');
  const [command, setCommand] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          command: type === 'mcp' ? command : null,
          baseUrl: type === 'http' ? baseUrl : null,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create server');
        return;
      }

      // Reset form and close
      setName('');
      setType('mcp');
      setCommand('');
      setBaseUrl('');
      setDescription('');
      onSuccess();
      onClose();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Server">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Server Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., GitHub MCP Server"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Server Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="mcp"
                checked={type === 'mcp'}
                onChange={() => setType('mcp')}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600"
              />
              <span className="text-gray-300">MCP Server</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="http"
                checked={type === 'http'}
                onChange={() => setType('http')}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600"
              />
              <span className="text-gray-300">HTTP API</span>
            </label>
          </div>
        </div>

        {type === 'mcp' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Command
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., npx @modelcontextprotocol/server-github"
            />
            <p className="mt-1 text-xs text-gray-500">
              Command to start the MCP server
            </p>
          </div>
        )}

        {type === 'http' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base URL
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., https://api.example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Base URL for the HTTP API
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="What does this server provide?"
            rows={2}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create Server'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

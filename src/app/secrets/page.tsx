'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';

interface Secret {
  id: string;
  name: string;
  createdAt: string;
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSecrets = useCallback(async () => {
    try {
      const response = await fetch('/api/secrets');
      if (!response.ok) throw new Error('Failed to fetch secrets');
      const data = await response.json();
      setSecrets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load secrets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSecretName,
          value: newSecretValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save secret');
      }

      setNewSecretName('');
      setNewSecretValue('');
      setShowAddModal(false);
      await fetchSecrets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save secret');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSecret = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the secret "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/secrets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete secret');
      await fetchSecrets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete secret');
    }
  };

  return (
    <DashboardLayout title="Secrets Vault">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Secrets Vault</h1>
            <p className="text-gray-500 mt-1">
              Store API keys and credentials securely. Values are encrypted at rest.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Secret
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Security notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <span className="text-lg">🔒</span>
            <div>
              <strong>Security Note:</strong> Secret values are never displayed after saving.
              To update a secret, delete and recreate it. All secrets are encrypted using AES-256-GCM.
            </div>
          </div>
        </div>

        {/* Secrets list */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading secrets...</div>
        ) : secrets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No secrets stored</h3>
            <p className="text-gray-500 mb-4">
              Add your first secret to securely store API keys and credentials.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Secret
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {secrets.map((secret) => (
                  <tr key={secret.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {secret.name}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400 italic">••••••••••••</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(secret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteSecret(secret.id, secret.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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

        {/* Usage instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">How to use secrets</h3>
          <p className="text-sm text-gray-600 mb-2">
            Secrets are automatically injected as environment variables when MCP servers start.
            Use meaningful names like:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li><code className="bg-gray-200 px-1 rounded">GITHUB_TOKEN</code> - Personal access token for GitHub API</li>
            <li><code className="bg-gray-200 px-1 rounded">DATABASE_URL</code> - PostgreSQL connection string</li>
            <li><code className="bg-gray-200 px-1 rounded">SLACK_BOT_TOKEN</code> - Slack bot OAuth token</li>
          </ul>
        </div>

        {/* Add Secret Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <form onSubmit={handleAddSecret}>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Secret</h2>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Name
                    </label>
                    <input
                      type="text"
                      value={newSecretName}
                      onChange={(e) => setNewSecretName(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '_'))}
                      placeholder="e.g., GITHUB_TOKEN"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use UPPER_SNAKE_CASE for environment variable names
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Value
                    </label>
                    <input
                      type="password"
                      value={newSecretValue}
                      onChange={(e) => setNewSecretValue(e.target.value)}
                      placeholder="Your API key or credential"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This value will be encrypted and can never be viewed again
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewSecretName('');
                      setNewSecretValue('');
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={saving || !newSecretName || !newSecretValue}
                  >
                    {saving ? 'Saving...' : 'Save Secret'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

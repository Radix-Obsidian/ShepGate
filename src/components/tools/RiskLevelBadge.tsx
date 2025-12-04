'use client';

import { useState } from 'react';

interface RiskLevelBadgeProps {
  toolId: string;
  currentLevel: string;
  onUpdate?: () => void;
  editable?: boolean;
}

export function RiskLevelBadge({ toolId, currentLevel, onUpdate, editable = true }: RiskLevelBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [level, setLevel] = useState(currentLevel);
  const [saving, setSaving] = useState(false);

  const getLevelStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe':
        return 'bg-green-900/50 text-green-300 border-green-700';
      case 'needs_approval':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'blocked':
        return 'bg-red-900/50 text-red-300 border-red-700';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getLevelLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe':
        return 'Safe';
      case 'needs_approval':
        return 'Approval';
      case 'blocked':
        return 'Blocked';
      default:
        return riskLevel;
    }
  };

  const handleChange = async (newLevel: string) => {
    if (newLevel === level) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskLevel: newLevel }),
      });

      if (response.ok) {
        setLevel(newLevel);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to update risk level:', error);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <select
        value={level}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        disabled={saving}
        autoFocus
        className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="safe">Safe</option>
        <option value="needs_approval">Approval</option>
        <option value="blocked">Blocked</option>
      </select>
    );
  }

  return (
    <button
      onClick={() => editable && setIsEditing(true)}
      disabled={!editable || saving}
      className={`px-2 py-1 rounded text-xs border ${getLevelStyles(level)} ${
        editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
      } transition-opacity`}
      title={editable ? 'Click to change risk level' : undefined}
    >
      {saving ? '...' : getLevelLabel(level)}
    </button>
  );
}

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type { ContextInfo } from '@/types/conversation';

interface ContextIndicatorProps {
  conversationId?: string;
}

export default function ContextIndicator({ conversationId }: ContextIndicatorProps) {
  const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadContextInfo();
    } else {
      setContextInfo(null);
    }
  }, [conversationId]);

  const loadContextInfo = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const info = await api.getConversationContext(conversationId);
      setContextInfo(info);
    } catch (err) {
      console.error('Failed to load context info:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!conversationId || !contextInfo) {
    return null;
  }

  const getUtilizationColor = (percent: number) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 75) return 'bg-yellow-500';
    if (percent < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getUtilizationTextColor = (percent: number) => {
    if (percent < 50) return 'text-green-600 dark:text-green-400';
    if (percent < 75) return 'text-yellow-600 dark:text-yellow-400';
    if (percent < 90) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="relative">
      {/* Compact Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
        title="Context Window Usage"
      >
        <svg
          className="w-4 h-4 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>

        <div className="flex items-center gap-1.5">
          <div className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getUtilizationColor(
                contextInfo.utilization_percent
              )}`}
              style={{ width: `${Math.min(contextInfo.utilization_percent, 100)}%` }}
            />
          </div>
          <span
            className={`font-medium ${getUtilizationTextColor(
              contextInfo.utilization_percent
            )}`}
          >
            {Math.round(contextInfo.utilization_percent)}%
          </span>
        </div>
      </button>

      {/* Detailed Popup */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDetails(false)}
          />

          {/* Details Panel */}
          <div className="absolute right-0 top-full mt-2 z-20 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Context Window Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Token Usage */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tokens Used
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {contextInfo.total_tokens.toLocaleString()} / {contextInfo.max_tokens.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getUtilizationColor(
                    contextInfo.utilization_percent
                  )}`}
                  style={{
                    width: `${Math.min(contextInfo.utilization_percent, 100)}%`,
                  }}
                />
              </div>

              {/* Message Count */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Messages
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {contextInfo.message_count}
                </span>
              </div>

              {/* Window Messages */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  In Context Window
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {contextInfo.context_window_messages} messages
                </span>
              </div>

              {/* Warning if approaching limit */}
              {contextInfo.utilization_percent > 75 && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  Context window is filling up. Older messages may be summarized.
                </div>
              )}

              {/* Info */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                The context window shows the last {contextInfo.context_window_messages}{' '}
                messages sent to the AI. As you chat more, older messages are
                automatically summarized to stay within the token limit.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

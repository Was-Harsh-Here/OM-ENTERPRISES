import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-xs border border-amber-400">
      <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
      <span>Offline Mode — Using cached shop records on your device</span>
    </div>
  );
};

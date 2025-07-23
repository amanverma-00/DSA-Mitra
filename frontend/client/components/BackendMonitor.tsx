import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '@shared/api';

interface BackendStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
  retryCount: number;
}

const BackendMonitor: React.FC = () => {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: true,
    lastChecked: new Date(),
    retryCount: 0
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setStatus({
          isConnected: true,
          lastChecked: new Date(),
          retryCount: 0
        });
      } else {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      setStatus(prev => ({
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed',
        retryCount: prev.retryCount + 1
      }));
    } finally {
      setIsChecking(false);
    }
  };

  // Check backend health on component mount and periodically
  useEffect(() => {
    checkBackendHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-retry connection if it fails
  useEffect(() => {
    if (!status.isConnected && status.retryCount < 3) {
      const retryTimeout = setTimeout(() => {
        checkBackendHealth();
      }, 5000); // Retry after 5 seconds
      
      return () => clearTimeout(retryTimeout);
    }
  }, [status.isConnected, status.retryCount]);

  if (status.isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">Backend Disconnected</span>
            </div>
            <Badge variant="destructive" className="text-xs">
              Offline
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {status.error && (
              <p className="mb-2">Error: {status.error}</p>
            )}
            <p>
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </p>
            {status.retryCount > 0 && (
              <p>Retry attempts: {status.retryCount}/3</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={checkBackendHealth}
              disabled={isChecking}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Retry'}</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Page</span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <p className="font-medium mb-1">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check if backend server is running</li>
              <li>Restart backend with: npm start</li>
              <li>Verify port 3001 is available</li>
              <li>Check network connection</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BackendMonitor;

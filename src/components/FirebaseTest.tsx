import React, { useEffect, useState } from 'react';
import { testFirebaseConnection } from '@/lib/firebase';

export const FirebaseTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await testFirebaseConnection();
        setIsConnected(result);
        setError(null);
        setErrorDetails(null);
      } catch (err) {
        setIsConnected(false);
        if (err instanceof Error) {
          setError(err.message);
          setErrorDetails(err.stack);
        } else {
          setError('An unknown error occurred');
          setErrorDetails(String(err));
        }
      }
    };

    testConnection();
  }, []);

  if (isConnected === null) {
    return <div className="p-4 rounded-lg border bg-gray-100">
      <div className="animate-pulse">Testing Firebase connection...</div>
    </div>;
  }

  return (
    <div className="p-4 rounded-lg border bg-white shadow-lg">
      <h2 className="text-xl font-bold mb-2">Firebase Connection Status</h2>
      {isConnected ? (
        <div className="text-green-500">✅ Firebase is connected and working properly!</div>
      ) : (
        <div className="text-red-500">
          <div className="font-bold">❌ Firebase connection failed</div>
          {error && (
            <div className="mt-2 text-sm border-l-2 border-red-500 pl-2">
              <div className="font-semibold">Error:</div>
              <div className="font-mono">{error}</div>
            </div>
          )}
          {errorDetails && (
            <div className="mt-2 text-xs text-gray-700 border-l-2 border-gray-300 pl-2 overflow-auto max-h-32">
              <div className="font-semibold">Details:</div>
              <pre className="whitespace-pre-wrap">{errorDetails}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
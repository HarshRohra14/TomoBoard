import React, { useState, useEffect } from 'react';
import { healthAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const TestIntegration = () => {
  const [tests, setTests] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { isConnected, socket } = useWebSocket();

  const runTest = async (testName, testFn) => {
    setTests(prev => [...prev, { name: testName, status: 'running', result: null }]);
    
    try {
      const result = await testFn();
      setTests(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'success', result } 
          : test
      ));
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'error', result: error.message } 
          : test
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Backend Health Check
    await runTest('Backend Health Check', async () => {
      const response = await healthAPI.check();
      return `Status: ${response.data.status}, Uptime: ${response.data.uptime}s`;
    });

    // Test 2: Authentication Test (if not logged in)
    if (!user) {
      await runTest('Demo Login Test', async () => {
        const response = await authAPI.login({
          email: 'demo@tomoboard.com',
          password: 'password123'
        });
        return `Login successful: ${response.data.user.email}`;
      });
    }

    // Test 3: User Profile Test
    await runTest('User Profile Test', async () => {
      const response = await authAPI.me();
      return `User: ${response.data.user.email} (${response.data.user.username})`;
    });

    // Test 4: WebSocket Connection Test
    await runTest('WebSocket Connection Test', async () => {
      return new Promise((resolve, reject) => {
        if (isConnected && socket) {
          resolve(`WebSocket connected: ${socket.id}`);
        } else {
          setTimeout(() => {
            if (isConnected && socket) {
              resolve(`WebSocket connected: ${socket.id}`);
            } else {
              reject(new Error('WebSocket not connected'));
            }
          }, 3000);
        }
      });
    });

    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    if (!isRunning && tests.length === 0) {
      runAllTests();
    }
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Backend Integration Test
          </h2>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests Again'}
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStatusIcon(test.status)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {test.name}
                  </h3>
                  <p className={`text-sm ${getStatusColor(test.status)}`}>
                    {test.status === 'running' ? 'Running...' : test.result}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  test.status === 'success' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : test.status === 'error'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {test.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {tests.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Click "Run Tests" to check backend integration
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Connection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">User Status:</span>
              <span className={user ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {user ? `Logged in as ${user.email}` : 'Not logged in'}
              </span>
            </div>
            <div>
              <span className="font-medium">WebSocket:</span>
              <span className={isConnected ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestIntegration;

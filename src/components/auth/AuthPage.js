import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Login from './Login';
import Signup from './Signup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sakura-50 to-pink-100 dark:from-gray-900 dark:to-black flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-sakura-600 dark:bg-sakura-500 rounded-xl mb-4 animate-sakura-bloom"
            >
              <span className="text-2xl font-bold text-white">T</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">TomoBoard</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Sakura Collaborative Platform</p>
          </div>

          {isLogin ? (
            <Login onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

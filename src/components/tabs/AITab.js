import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Crown,
  CreditCard,
  Check,
  Zap,
  Brain,
  FileText,
  Image,
  Mic,
  MessageSquare,
  PenTool,
  Upload,
  Download,
  Copy,
  RefreshCw,
  Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AITab = () => {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState('text-generation');
  const [inputText, setInputText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const aiFeatures = [
    {
      id: 'text-generation',
      title: 'Text Generation',
      description: 'Generate high-quality content, summaries, and documents',
      icon: FileText,
      isPro: false,
      usageCount: 15,
      limit: 20
    },
    {
      id: 'image-generation',
      title: 'Image Generation',
      description: 'Create stunning visuals and illustrations from text prompts',
      icon: Image,
      isPro: true,
      usageCount: 0,
      limit: 50
    },
    {
      id: 'voice-synthesis',
      title: 'Voice Synthesis',
      description: 'Convert text to natural-sounding speech',
      icon: Mic,
      isPro: true,
      usageCount: 0,
      limit: 30
    },
    {
      id: 'smart-chat',
      title: 'Smart Assistant',
      description: 'Intelligent chatbot for project assistance and Q&A',
      icon: MessageSquare,
      isPro: false,
      usageCount: 8,
      limit: 10
    },
    {
      id: 'diagram-generation',
      title: 'Diagram Generator',
      description: 'Auto-generate flowcharts, wireframes, and diagrams',
      icon: PenTool,
      isPro: true,
      usageCount: 0,
      limit: 25
    },
    {
      id: 'content-analysis',
      title: 'Content Analysis',
      description: 'Analyze documents for insights, sentiment, and key themes',
      icon: Brain,
      isPro: true,
      usageCount: 0,
      limit: 40
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic text generation (20/month)',
        'Smart assistant (10/month)',
        'Standard whiteboard features',
        'Basic collaboration',
        'Email support'
      ],
      current: user?.plan === 'free'
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'month',
      popular: true,
      features: [
        'Unlimited text generation',
        'AI image generation (50/month)',
        'Voice synthesis (30/month)',
        'Smart diagram generation',
        'Advanced content analysis',
        'Priority support',
        'Team collaboration features'
      ],
      current: user?.plan === 'pro'
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: 'month',
      features: [
        'Everything in Pro',
        'Unlimited AI features',
        'Custom AI models',
        'Advanced analytics',
        'Single sign-on (SSO)',
        'Priority phone support',
        'Custom integrations'
      ],
      current: user?.plan === 'enterprise'
    }
  ];

  const handleFeatureUse = async (feature) => {
    if (feature.isPro && user?.plan === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    if (feature.usageCount >= feature.limit) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      switch (activeFeature) {
        case 'text-generation':
          setGeneratedContent(`Generated content based on: "${inputText}"\n\nThis is a sample of AI-generated text that would be created based on your input. The actual implementation would integrate with AI services like OpenAI GPT, Claude, or other text generation APIs to produce high-quality content.`);
          break;
        case 'smart-chat':
          setGeneratedContent(`AI Assistant: I understand you're asking about "${inputText}". Based on your project context, here are some suggestions:\n\n1. Consider breaking this into smaller components\n2. Look into the existing design patterns in your codebase\n3. Don't forget to add proper documentation\n\nWould you like me to elaborate on any of these points?`);
          break;
        default:
          setGeneratedContent('AI feature simulation - content would be generated here based on the selected feature and your input.');
      }
      setIsGenerating(false);
    }, 2000);
  };

  const getFeatureContent = () => {
    const feature = aiFeatures.find(f => f.id === activeFeature);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <feature.icon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
          
          {feature.isPro && user?.plan === 'free' && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium">Pro Feature</span>
            </div>
          )}
        </div>

        {/* Usage Indicator */}
        {!feature.isPro || user?.plan !== 'free' ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Usage this month</span>
              <span className="text-sm font-medium text-gray-900">
                {feature.usageCount}/{feature.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${(feature.usageCount / feature.limit) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Input Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeFeature === 'image-generation' ? 'Describe the image you want to create:' :
               activeFeature === 'voice-synthesis' ? 'Enter text to convert to speech:' :
               activeFeature === 'smart-chat' ? 'Ask me anything about your project:' :
               'Enter your prompt or content:'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field w-full h-32 resize-none"
              placeholder={
                activeFeature === 'image-generation' ? 'A futuristic office workspace with holographic displays...' :
                activeFeature === 'voice-synthesis' ? 'Welcome to TomoBoard, your collaborative workspace...' :
                activeFeature === 'smart-chat' ? 'How can I improve my team\'s collaboration workflow?' :
                'Generate a project plan for...'
              }
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleFeatureUse(feature)}
              disabled={isGenerating || !inputText.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
            
            {activeFeature === 'content-analysis' && (
              <button className="btn-secondary flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
              </button>
            )}
          </div>
        </div>

        {/* Output Area */}
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Generated Content</h4>
              <div className="flex items-center space-x-2">
                <button className="btn-secondary text-sm flex items-center space-x-2">
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
                <button className="btn-secondary text-sm flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {generatedContent}
              </pre>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI-Powered Features</h1>
              <p className="text-gray-600">Enhance your workflow with artificial intelligence</p>
            </div>
          </div>
          
          {user?.plan === 'free' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex gap-6">
        {/* Features Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-80 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">AI Features</h2>
          
          <div className="space-y-2">
            {aiFeatures.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  activeFeature === feature.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${feature.isPro && user?.plan === 'free' ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activeFeature === feature.id ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <feature.icon className={`h-5 w-5 ${
                      activeFeature === feature.id ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{feature.title}</h3>
                      {feature.isPro && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                    
                    {(!feature.isPro || user?.plan !== 'free') && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{feature.usageCount} used</span>
                          <span>{feature.limit} limit</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-primary-600 h-1 rounded-full"
                            style={{ width: `${(feature.usageCount / feature.limit) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          <div className="card h-full">
            {getFeatureContent()}
          </div>
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
                  <p className="text-gray-600">Unlock the full power of AI features</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`border rounded-xl p-6 relative ${
                    plan.popular
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      plan.current
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade Now'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>All plans include a 14-day free trial. Cancel anytime.</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AITab;

import React from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';

interface LoadingScreenProps {
  currentStep: 'session' | 'agent' | 'complete';
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ currentStep, onComplete }) => {
  React.useEffect(() => {
    if (currentStep === 'complete') {
      // Add a small delay to show the completion state before redirecting
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const steps = [
    {
      id: 'session',
      title: 'Creating Session',
      description: 'Initializing secure connection for claim processing',
      icon: Shield,
      status: currentStep === 'session' ? 'loading' : currentStep === 'agent' || currentStep === 'complete' ? 'complete' : 'pending'
    },
    {
      id: 'agent',
      title: 'AI Agent Processing',
      description: 'Lead Validator and Action Recommender agents analyzing claim',
      icon: FileText,
      status: currentStep === 'agent' ? 'loading' : currentStep === 'complete' ? 'complete' : 'pending'
    },
    {
      id: 'complete',
      title: 'Analysis Complete',
      description: 'Validation results ready for review',
      icon: CheckCircle,
      status: currentStep === 'complete' ? 'complete' : 'pending'
    }
  ];

  const getStepIcon = (step: typeof steps[0]) => {
    const IconComponent = step.icon;
    if (step.status === 'loading') {
      return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
    } else if (step.status === 'complete') {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else {
      return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepClasses = (step: typeof steps[0]) => {
    if (step.status === 'loading') {
      return 'bg-blue-50 border-blue-200';
    } else if (step.status === 'complete') {
      return 'bg-green-50 border-green-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <FileText className="h-10 w-10 text-blue-600" />
              {currentStep === 'agent' && (
                <div className="absolute -top-1 -right-1">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Claim</h1>
          <p className="text-sm text-gray-600">
            Our AI agents are analyzing your EDI 837 claim
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-lg border p-4 transition-all duration-500 ${getStepClasses(step)}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${step.status === 'loading' ? 'text-blue-800' :
                      step.status === 'complete' ? 'text-green-800' : 'text-gray-600'
                    }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-1 ${step.status === 'loading' ? 'text-blue-600' :
                      step.status === 'complete' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                    {step.description}
                  </p>
                </div>
                {step.status === 'loading' && (
                  <div className="flex-shrink-0">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {currentStep === 'session' ? '33%' :
                currentStep === 'agent' ? '66%' : '100%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: currentStep === 'session' ? '33%' :
                  currentStep === 'agent' ? '66%' : '100%'
              }}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-700 font-medium">
              {currentStep === 'session' && 'Creating secure session...'}
              {currentStep === 'agent' && 'AI agents analyzing claim data...'}
              {currentStep === 'complete' && 'Analysis complete! Preparing results...'}
            </p>
            {currentStep === 'agent' && (
              <p className="text-xs text-gray-500 mt-1">
                Validating against industry standards
              </p>
            )}
          </div>
        </div>

        {/* Loading Animation */}
        {currentStep === 'agent' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

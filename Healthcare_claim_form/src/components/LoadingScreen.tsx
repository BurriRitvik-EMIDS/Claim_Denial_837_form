import React from 'react';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  // When true, the modal will pause at the 'recommender' step until isAgentDone becomes true
  awaitExternalComplete?: boolean;
  // External signal that the agent run has finished and response is available
  isAgentDone?: boolean;
}

interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed';
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, onComplete, awaitExternalComplete = true, isAgentDone = false }) => {
  const [steps, setSteps] = React.useState<ProcessStep[]>([
    { id: 'session', label: 'Session Creation', status: 'pending' },
    { id: 'validator', label: 'Lead Validator Agent', status: 'pending' },
    { id: 'recommender', label: 'Action Recommender Agent', status: 'pending' }
  ]);
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setHasStarted(false);
      return;
    }

    // Only reset steps if we haven't started the process yet
    if (!hasStarted) {
      setSteps([
        { id: 'session', label: 'Session Creation', status: 'pending' },
        { id: 'validator', label: 'Lead Validator Agent', status: 'pending' },
        { id: 'recommender', label: 'Action Recommender Agent', status: 'pending' }
      ]);
      setHasStarted(true);
    }

    const processSteps = async () => {
      // Step 1: Session Creation
      setSteps(prev => prev.map(step => 
        step.id === 'session' ? { ...step, status: 'loading' } : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSteps(prev => prev.map(step => 
        step.id === 'session' ? { ...step, status: 'completed' } : step
      ));

      // Step 2: Lead Validator Agent
      setSteps(prev => prev.map(step => 
        step.id === 'validator' ? { ...step, status: 'loading' } : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setSteps(prev => prev.map(step => 
        step.id === 'validator' ? { ...step, status: 'completed' } : step
      ));

      // Step 3: Action Recommender Agent
      setSteps(prev => prev.map(step => 
        step.id === 'recommender' ? { ...step, status: 'loading' } : step
      ));
      
      if (!awaitExternalComplete) {
        // Auto-complete after a short delay when not awaiting external signal
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSteps(prev => prev.map(step => 
          step.id === 'recommender' ? { ...step, status: 'completed' } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete();
      }
    };

    if (!hasStarted) {
      processSteps();
    }
  }, [isOpen, onComplete, awaitExternalComplete, hasStarted]);

  // When awaiting external completion, finish the last step when agent is done
  React.useEffect(() => {
    if (!isOpen || !awaitExternalComplete || !hasStarted) return;
    if (isAgentDone) {
      setSteps(prev => prev.map(step => 
        step.id === 'recommender' ? { ...step, status: 'completed' } : step
      ));
      const t = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(t);
    }
  }, [isAgentDone, isOpen, awaitExternalComplete, onComplete, hasStarted]);

  if (!isOpen) return null;

  const getStepIcon = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />;
    }
  };

  const getStepStyles = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'loading':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Glass morphism backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Processing Claim Validation
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            AI agents are analyzing your healthcare claim data
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 sm:space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center p-3 sm:p-4 rounded-lg border transition-all duration-300 ${getStepStyles(step.status)}`}
            >
              <div className="flex-shrink-0 mr-3 sm:mr-4">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{step.label}</p>
                <p className="text-xs mt-1 opacity-75">
                  {step.status === 'completed' && 'Completed successfully'}
                  {step.status === 'loading' && 'Processing...'}
                  {step.status === 'pending' && 'Waiting to start'}
                </p>
              </div>
              {step.status === 'loading' && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 sm:mt-6">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500">
            This process typically takes 2-4 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Shield,
  Lightbulb,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';

interface ValidationResult {
  code: string;
  denied: boolean;
  probability: string;
  reason: string;
  suggested_fix: string;
  service_code?: string;
  risk_detected?: boolean;
  risk_percentage?: string;
  analysis?: string;
  recommendation?: string;
  priority?: string;
  risk_level?: string;
}

interface ResultsPageProps {
  validationStatus: string;
  results: ValidationResult[];
  onBack: () => void;
  processingTime?: number;
  agentMessages?: any[];
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  validationStatus,
  results,
  onBack,
  processingTime = 2.3,
  agentMessages = []
}) => {
  const deniedCount = results.filter(r => r.denied).length;
  const approvedCount = results.filter(r => !r.denied).length;
  const totalAmount = results.length * 90; // Sample calculation
  const riskAmount = results.filter(r => r.denied).reduce((sum, r) => sum + 90, 0);

  const getRiskLevel = (result: ValidationResult) => {
    // Use priority from agent response if available, otherwise calculate from probability
    const priority = result.priority || result.risk_level;
    const probability = result.probability;

    if (priority) {
      const priorityLower = priority.toLowerCase();
      if (priorityLower.includes('high')) {
        return { level: 'High', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
      } else if (priorityLower.includes('medium')) {
        return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
      } else if (priorityLower.includes('low')) {
        return { level: 'Low', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
      }
    }

    // Fallback to probability-based calculation
    const prob = parseInt(probability.replace('%', ''));
    if (prob >= 80) return { level: 'High', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
    if (prob >= 50) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
    return { level: 'Low', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
  };

  const getStatusIcon = (result: ValidationResult) => {
    if (!result.denied) return <CheckCircle className="h-6 w-6 text-green-500" />;

    // Use priority from agent response if available
    const priority = result.priority || result.risk_level;
    if (priority) {
      const priorityLower = priority.toLowerCase();
      if (priorityLower.includes('high')) return <XCircle className="h-6 w-6 text-red-500" />;
      if (priorityLower.includes('medium')) return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }

    // Fallback to probability-based calculation
    const prob = parseInt(result.probability.replace('%', ''));
    if (prob >= 80) return <XCircle className="h-6 w-6 text-red-500" />;
    return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Validation Results</h1>
                <p className="text-sm text-gray-600 mt-1">EDI 837 Professional Claim Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Agent Analysis */}
        {agentMessages && agentMessages.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Agent Analysis</h3>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">AI-Powered Analysis</span>
                </div>
              </div>
              <div className="space-y-4">
                {agentMessages.map((message, index) => {
                  const textContent = message.content?.parts?.[0]?.text;
                  const author = message.author;
                  if (textContent && author) {
                    // Try to parse JSON content and format it nicely
                    let formattedContent = textContent;
                    try {
                      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
                      if (jsonMatch) {
                        const jsonData = JSON.parse(jsonMatch[1]);
                        if (jsonData.code) {
                          formattedContent = `code: ${jsonData.code}\n\ndenied: ${jsonData.denied}\n\nprobability of denial based on given reasons: ${jsonData['probability of denial based on given reasons'] || jsonData.probability || '0%'}\n\nreason: ${jsonData.reason || 'No analysis provided'}\n\nsuggested_fix: ${jsonData.suggested_fix || 'No recommendation provided'}`;
                        }
                      }
                    } catch (e) {
                      // If parsing fails, use original content
                    }

                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-700">{author}</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{formattedContent}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}



        {/* Processing Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">Completed in {processingTime} seconds</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">Session Creation: Success</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">Lead Validator Agent: Completed</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">Action Recommender Agent: Completed</span>
            </div>
          </div>
        </div>

        {/* Validation Status Banner */}
        <div className="mb-8">
          <div className={`rounded-lg p-6 ${validationStatus === 'valid' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {validationStatus === 'valid' ? (
                <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 mr-4" />
              )}
              <div>
                <h2 className={`text-xl font-semibold ${validationStatus === 'valid' ? 'text-green-800' : 'text-red-800'}`}>
                  LeadValidatorAgent: {validationStatus.charAt(0).toUpperCase() + validationStatus.slice(1)}
                </h2>
                <p className={`text-sm mt-1 ${validationStatus === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                  {validationStatus === 'valid'
                    ? 'Claim structure is valid and ready for processing'
                    : 'Claim contains validation errors that need attention'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Validation Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Detailed Analysis</h3>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">AI-Powered Validation</span>
            </div>
          </div>

          {results.map((result, index) => {
            const risk = getRiskLevel(result);
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-4 border-b border-gray-200 ${risk.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result)}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Code: {result.code}</h4>
                        <p className="text-sm text-gray-600">
                          {result.denied ? 'Denial Risk Detected' : 'Approved for Processing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${risk.bgColor} ${risk.textColor} ${risk.borderColor} border`}>
                        {result.probability} Risk
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{risk.level} Priority</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Analysis */}
                    <div>
                      <div className="flex items-center mb-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        <h5 className="font-semibold text-gray-900">Risk Analysis</h5>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{result.reason}</p>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div>
                      <div className="flex items-center mb-3">
                        <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                        <h5 className="font-semibold text-gray-900">Recommended Action</h5>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-800 leading-relaxed">{result.suggested_fix}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {result.denied && (
                    <div className="mt-6 flex items-center space-x-3">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Apply Fix
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Review Documentation
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Flag for Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Analysis Complete</h3>
              <p className="text-blue-100">
                {deniedCount > 0
                  ? `${deniedCount} service${deniedCount > 1 ? 's' : ''} require${deniedCount === 1 ? 's' : ''} attention before submission`
                  : 'All services passed validation and are ready for submission'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {results.length > 0 && results.some(r => r.denied)
                  ? results.find(r => r.denied)?.probability || '0%'
                  : '0%'
                }
              </p>
              <p className="text-blue-100 text-sm">Denial Risk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import { 
  initializeEmailService, 
  sendEmail, 
  generateClaimReviewEmail,
  validateEmail,
  type ClaimData 
} from '../utils/emailService';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Lightbulb,
  ArrowLeft,
  Download,
  Share2,
  Award,
  Star,
  Mail,
  X,
  Paperclip,
  Send
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

interface AgentResponse {
  agent_name: string;
  response: {
    validation_status?: string;
    code?: string;
    denied?: boolean;
    probability?: string;
    reason?: string;
    suggested_fix?: string;
    [key: string]: any;
  };
}

interface ResultsPageProps {
  validationStatus: string;
  results: ValidationResult[];
  onBack: () => void;
  processingTime?: number;
  agentMessages?: any[];
  rawAgentResponses?: string; // Raw agent responses as text
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  validationStatus,
  results,
  onBack,
  processingTime = 2.3,
  agentMessages = [],
  rawAgentResponses
}) => {
  // Initialize Email Service once
  React.useEffect(() => {
    const initEmail = async () => {
      try {
        await initializeEmailService();
      } catch (error) {
        console.error('Failed to initialize email service:', error);
        setSendError('Email service initialization failed. Please refresh the page.');
      }
    };
    initEmail();
  }, []);

  // Modal state for Flag for Review
  const [showFlagModal, setShowFlagModal] = React.useState(false);
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [currentClaimData, setCurrentClaimData] = React.useState<ClaimData | null>(null);

  const [emailData, setEmailData] = React.useState({
    from: 'burriritvik@outlook.com',
    to: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setShowFlagModal(false);
    setSendError(null);
    setSendSuccess(null);
    setAttachedFile(null);
    setCurrentClaimData(null);
    // Reset form
    setEmailData({
      from: 'burriritvik@outlook.com',
      to: '',
      subject: '',
      message: ''
    });
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setAttachedFile(file);
    } else {
      alert('Please select a PDF file.');
    }
  };

  const handleOpenFlagModal = (claimCode: string, riskLevel: string, reason: string) => {
    // Reset any previous states
    setSendError(null);
    setSendSuccess(null);
    setAttachedFile(null);
    
    // Generate comprehensive email content using the email service
    const claimData: ClaimData = {
      code: claimCode,
      riskLevel,
      reason,
      validationStatus,
      totalClaims: results.length,
      deniedClaims: results.filter(r => r.denied).length,
      processingTime
    };

    // Store claim data for later use when sending email
    setCurrentClaimData(claimData);
    
    const generatedEmail = generateClaimReviewEmail(claimData);
    setEmailData(generatedEmail);
    setShowFlagModal(true);
  };

  // Export Report -> generate PDF via utils/pdfGenerator and download
  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      const deniedCount = results.filter(r => r.denied).length;
      const approvedCount = results.length - deniedCount;
      await generatePDF({
        validationStatus,
        results,
        processingTime,
        agentMessages,
        deniedCount,
        approvedCount
      });
    } catch (e) {
      console.error('Failed to export report:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    setSendError(null);
    setSendSuccess(null);
    setIsSending(true);

    try {
      // Use the stored claim data from when modal was opened
      if (!currentClaimData) {
        throw new Error('Claim data not available. Please close and reopen the modal.');
      }

      // Prepare attachment info
      const attachmentInfo = {
        name: attachedFile?.name || 'None',
        hasAttachment: !!attachedFile
      };

      // Send email using the email service with actual claim data
      const result = await sendEmail(emailData, currentClaimData, attachmentInfo);

      if (result.success) {
        setSendSuccess(result.message);
        
        // Auto-close modal after successful send
        setTimeout(() => {
          handleCloseModal();
        }, 3000);
      } else {
        setSendError(result.message);
      }
    } catch (error: any) {
      console.error('Unexpected error sending email:', error);
      setSendError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  // Parse agent responses from raw text
  const parseAgentResponses = (rawText: string): AgentResponse[] => {
    if (!rawText) return [];
    
    const responses: AgentResponse[] = [];
    const lines = rawText.split('\n');
    let currentAgent = '';
    let currentJsonBlock = '';
    let inJsonBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect agent names (ending with 'Agent')
      if (line.endsWith('Agent') && !line.startsWith('{') && !line.startsWith('}')) {
        currentAgent = line;
        continue;
      }
      
      // Detect JSON block start
      if (line === '```json' || line.startsWith('```json')) {
        inJsonBlock = true;
        currentJsonBlock = '';
        continue;
      }
      
      // Detect JSON block end
      if (line === '```' && inJsonBlock) {
        inJsonBlock = false;
        try {
          const parsedResponse = JSON.parse(currentJsonBlock);
          responses.push({
            agent_name: currentAgent,
            response: parsedResponse
          });
        } catch (e) {
          console.warn('Failed to parse agent response:', e);
        }
        currentJsonBlock = '';
        currentAgent = '';
        continue;
      }
      
      // Collect JSON content
      if (inJsonBlock) {
        currentJsonBlock += line + '\n';
      }
    }
    
    return responses;
  };

  const parsedAgentResponses = parseAgentResponses(rawAgentResponses || '');
  
  const deniedCount = results.filter(r => r.denied).length;
  const approvedCount = results.filter(r => !r.denied).length;
  const totalAmount = results.length * 90; // Sample calculation
  const riskAmount = results.filter(r => r.denied).reduce((sum, r) => sum + 90, 0);

  // Check if this is a successful validation (all approved, 0% risk)
  const isSuccessfulValidation = validationStatus === 'valid' && deniedCount === 0;
  const hasCO59Code = results.some(r => r.code === 'CO59');

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
                <h1 className="text-2xl font-bold text-gray-900">Denial Likelihood Analysis</h1>
                <p className="text-sm text-gray-600 mt-1">Prediction score with actionable fixes for your health claim.</p>
              </div>
      {/* Floating Notifications */}
      {(sendError || sendSuccess) && (
        <div className="fixed top-4 right-4 z-[60] max-w-sm">
          {sendError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm flex items-start space-x-3 shadow-lg mb-2" aria-live="assertive">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Email Failed to Send</p>
                <p className="mt-1">{sendError}</p>
                <p className="mt-2 text-xs text-red-600">
                  💡 Tip: Check your internet connection and try again.
                </p>
              </div>
              <button
                onClick={() => setSendError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {sendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm flex items-start space-x-3 shadow-lg" aria-live="polite">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Email Sent Successfully!</p>
                <p className="mt-1">{sendSuccess}</p>
              </div>
              <button
                onClick={() => setSendSuccess(null)}
                className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Flag for Review Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Sticky */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Flag for Review</h3>
                  <p className="text-sm text-gray-600">Send claim for manual review</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">


              {/* From Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <input
                  type="email"
                  value={emailData.from}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              {/* To Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('to', value);
                    // Real-time email validation feedback
                    if (value && !validateEmail(value)) {
                      e.target.setCustomValidity('Please enter a valid email address');
                    } else {
                      e.target.setCustomValidity('');
                    }
                  }}
                  placeholder="reviewer@healthcare.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSending}
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSending}
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSending}
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach PDF (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Choose PDF
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileAttach}
                      className="hidden"
                      disabled={isSending}
                    />
                  </label>
                  {attachedFile && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>{attachedFile.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  📎 Note: File attachments are for reference only and won't be sent via email. 
                  The reviewer will be notified to request documents separately if needed.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isSending}
              >
                Cancel
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSendEmail}
                  disabled={isSending || !emailData.to.trim() || !emailData.subject.trim() || !emailData.message.trim()}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleExportReport} disabled={isExporting} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting…' : 'Export Report'}
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
        {/* Success Banner for Approved Claims */}
        {isSuccessfulValidation && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg text-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">🎉All Checks Passed!</h2>
                    <p className="text-green-100 text-lg">
                      Your claim has passed all validation checks and is ready for submission
                    </p>
                    {hasCO59Code && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-300" />
                        <span className="text-green-100 font-medium">CO59 Code: Approved for Processing</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* <div className="text-right">
                  <div className="text-4xl font-bold">0%</div>
                  <div className="text-green-100">Denial Risk</div>
                  <div className="text-sm text-green-200 mt-1">Ready to Submit</div>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* AI Agent Analysis */}
        {agentMessages && agentMessages.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Agent Analysis</h3>
                {/* <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">AI-Powered Analysis</span>
                </div> */}
              </div>
              <div className="space-y-4">
                {agentMessages.map((message, index) => {
                  const textContent = message.content?.parts?.[0]?.text;
                  const author = message.author;
                  if (textContent && author) {
                    // Try to parse JSON content and format it nicely
                    let formattedContent = textContent;
                    let parsedData = null;
                    try {
                      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
                      if (jsonMatch) {
                        parsedData = JSON.parse(jsonMatch[1]);
                        if (parsedData.code) {
                          formattedContent = `code: ${parsedData.code}\n\ndenied: ${parsedData.denied}\n\nprobability of denial based on given reasons: ${parsedData['probability of denial based on given reasons'] || parsedData.probability || '0%'}\n\nreason: ${parsedData.reason || 'No analysis provided'}\n\nsuggested_fix: ${parsedData.suggested_fix || 'No recommendation provided'}`;
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
            {/* <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">AI-Powered Validation</span>
            </div> */}
          </div>

          {results.map((result, index) => {
            const risk = getRiskLevel(result);

            // Find matching agent data for this result
            const leadValidatorResponse = parsedAgentResponses.find(r => 
              r.agent_name === 'LeadValidatorAgent'
            )?.response;
            
            const actionRecommenderResponse = parsedAgentResponses.find(r => 
              r.agent_name === 'ActionRecommenderAgent' && 
              (r.response.code === result.code || !result.code)
            )?.response;
            
            // Use agent data if available, otherwise fall back to result data
            const displayData = {
              validation_status: leadValidatorResponse?.validation_status || (result.denied ? 'invalid' : 'valid'),
              code: actionRecommenderResponse?.code || result.code,
              denied: actionRecommenderResponse?.denied ?? result.denied,
              probability: actionRecommenderResponse?.probability || result.probability,
              reason: actionRecommenderResponse?.reason || result.reason,
              suggested_fix: actionRecommenderResponse?.suggested_fix || result.suggested_fix
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-4 border-b border-gray-200 ${risk.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result)}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Code: {displayData.code || result.code}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {displayData.denied ? 'Denial Risk Detected' : 'Approved for Processing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${risk.bgColor} ${risk.textColor} ${risk.borderColor} border`}>
                        {displayData.probability || result.probability} Risk
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
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {displayData.reason || result.reason}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div>
                      <div className="flex items-center mb-3">
                        <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                        <h5 className="font-semibold text-gray-900">Recommended Action</h5>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {displayData.suggested_fix || result.suggested_fix}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Analysis Summary - Only show if we have parsed responses */}
                  {parsedAgentResponses.length > 0 && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-blue-600" />
                        AI Agent Analysis
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {leadValidatorResponse && (
                          <div className="bg-white rounded-md p-3">
                            <h6 className="text-xs font-medium text-gray-600 mb-1">Lead Validator</h6>
                            <p className={`text-sm font-medium ${
                              leadValidatorResponse.validation_status === 'valid' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              Status: {leadValidatorResponse.validation_status === 'valid' ? 'Valid' : 'Invalid'}
                            </p>
                          </div>
                        )}
                        {actionRecommenderResponse && (
                          <div className="bg-white rounded-md p-3">
                            <h6 className="text-xs font-medium text-gray-600 mb-1">Action Recommender</h6>
                            <p className="text-sm font-medium text-blue-600">
                              Code: {actionRecommenderResponse.code}
                            </p>
                            <p className="text-xs text-gray-600">
                              Risk: {actionRecommenderResponse.probability}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {result.denied && (
                    <div className="mt-6 flex items-center space-x-3">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Apply Fix
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Review Documentation
                      </button>
                      <button
                        onClick={() => {
                          const risk = getRiskLevel(result).level;
                          handleOpenFlagModal(result.code, risk, result.reason);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-amber-300 text-sm font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                      >
                        <Mail className="h-4 w-4 mr-2 text-amber-600" />
                        Flag for Review
                      </button>
                    </div>
                  )}

                  {/* Success Actions for Approved Claims */}
                  {!result.denied && (
                    <div className="mt-6 flex items-center space-x-3">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Ready to Submit
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Export Claim
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Results
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

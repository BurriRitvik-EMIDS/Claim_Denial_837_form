import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Send, RotateCcw } from 'lucide-react';
import { FormData } from './types/FormTypes';
import { FormSection } from './components/FormSection';
import { FormField } from './components/FormField';
import { FileUpload } from './components/FileUpload';
import { ResultsPage } from './components/ResultsPage';
import { LoadingModal } from './components/LoadingScreen';
import { parseAgentResponse, ParsedResponse } from './utils/responseParser';
import {
  getInitialFormData,
  saveFormToSession,
  loadFormFromSession,
  genderOptions,
  stateOptions,
  relationshipOptions,
  payerTypeOptions,
  placeOfServiceOptions,
  claimFilingIndicatorOptions,
  releaseOfInformationOptions,
  diagnosisTypeOptions,
  insuranceTypeOptions,
  unitOfMeasureOptions,
  attachmentTypeOptions,
  attachmentTransmissionOptions,
  otherPayerResponsibilityOptions,
  claimNoteOptions,
  diagnosisPointerOptions,
  fieldPlaceholders,
  validateField,
  validateForm,
  ValidationResult,
  enhancedValidationRules
} from './utils/formUtils';


function App() {
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submittedData, setSubmittedData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationResult>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [validationSummary, setValidationSummary] = useState<{
    totalFields: number;
    validFields: number;
    invalidFields: number;
    requiredFields: number;
    completedRequired: number;
  }>({
    totalFields: 0,
    validFields: 0,
    invalidFields: 0,
    requiredFields: 0,
    completedRequired: 0
  });
  // --- AGENT RESPONSE STATE ---
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{
    sessionCreated: boolean;
    agentRun: boolean;
    errors: string[];
  }>({
    sessionCreated: false,
    agentRun: false,
    errors: []
  });



  // --- RESULTS PAGE STATE ---
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [parsedResponse, setParsedResponse] = useState<ParsedResponse | null>(null);

  // --- LOADING SCREEN STATE ---
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);





  // Load form data from session on mount
  useEffect(() => {
    const savedData = loadFormFromSession();
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  // Save form data to session whenever it changes
  useEffect(() => {
    saveFormToSession(formData);
  }, [formData]);

  // Update validation summary whenever validation errors change
  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    const validFields = Object.values(validationErrors).filter(result => result.isValid).length;
    const invalidFields = Object.values(validationErrors).filter(result => !result.isValid).length;

    // Count required fields and completed required fields
    const requiredFields = Object.keys(enhancedValidationRules).filter(field =>
      enhancedValidationRules[field]?.required
    ).length;

    const completedRequired = Object.keys(enhancedValidationRules)
      .filter(field => enhancedValidationRules[field]?.required)
      .filter(field => {
        const value = formData[field as keyof FormData];
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'boolean') return value;
        if (Array.isArray(value)) return value.length > 0;
        return false;
      }).length;

    setValidationSummary({
      totalFields,
      validFields,
      invalidFields,
      requiredFields,
      completedRequired
    });
  }, [validationErrors, formData]);

  const handleFieldChange = (name: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field immediately and update validation state
    const validation = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: validation
    }));
  };

  const handleFileUpload = async (file: File, parsedData: FormData) => {
    setUploadedFile(file);
    console.log('File uploaded successfully:', file.name);
    console.log('Parsed data:', parsedData);

    // Update form with parsed data
    setFormData(prevData => ({
      ...prevData,
      ...parsedData
    }));
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate entire form
    const formValidation = validateForm(formData);
    setValidationErrors(formValidation);
    setShowValidation(true);

    // Check if form is valid
    const hasErrors = Object.values(formValidation).some(result => !result.isValid);
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    setAgentResponse(null);
    setApiStatus({
      sessionCreated: false,
      agentRun: false,
      errors: []
    });

    // Show loading screen
    setShowLoadingScreen(true);

    // Save the submitted data for display
    setSubmittedData(JSON.stringify(formData, null, 2));

    try {
      console.log('Starting API calls...');



      // 1. Create session using proxy to avoid CORS
      console.log('Creating session...');

      // Generate unique session ID with timestamp
      const timestamp = Date.now();
      const sessionId = `s_${timestamp}`;
      const userId = `u_${timestamp}`;

      console.log('Generated session ID:', sessionId);
      console.log('Generated user ID:', userId);

      const sessionRes = await fetch(`/api/apps/lead_qualification_agent/users/${userId}/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Session response status:', sessionRes.status);
      console.log('Session response headers:', sessionRes.headers);

      if (!sessionRes.ok) {
        const errorText = await sessionRes.text();
        throw new Error(`Session creation failed: ${sessionRes.status} - ${errorText}`);
      }

      const sessionData = await sessionRes.json();
      console.log('Session created successfully:', sessionData);
      setApiStatus(prev => ({ ...prev, sessionCreated: true }));

      // 2. Run agent
      console.log('Running agent...');
      console.log('Using session ID:', sessionId);
      console.log('Using user ID:', userId);

      // 2. Run agent using proxy to avoid CORS
      const runRes = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appName: "lead_qualification_agent",
          userId: userId,
          sessionId: sessionId,
          newMessage: {
            parts: [
              {
                text: JSON.stringify(formData)
              }
            ],
            role: "user"
          }
        })
      });

      console.log('Agent response status:', runRes.status);
      console.log('Agent response headers:', runRes.headers);

      if (!runRes.ok) {
        const errorText = await runRes.text();
        throw new Error(`Agent run failed: ${runRes.status} - ${errorText}`);
      }

      const runData = await runRes.json();
      console.log('Agent response data:', runData);
      setApiStatus(prev => ({ ...prev, agentRun: true })); // Set agentRun to true before setting agentResponse
      setAgentResponse(JSON.stringify(runData, null, 2));

      // Parse the response and prepare for results page
      const parsed = parseAgentResponse(JSON.stringify(runData, null, 2));
      setParsedResponse(parsed);

      // Show success message
      console.log('✅ All API calls completed successfully!');

    } catch (err: any) {
      console.error('API Error:', err);
      const errorMessage = `Error: ${err?.message || 'Unknown error'}\n\nStack: ${err?.stack || 'No stack trace'}`;
      setAgentResponse(errorMessage);
      setApiStatus(prev => ({
        ...prev,
        errors: [...prev.errors, err?.message || 'Unknown error']
      }));

      // Hide loading screen on error
      setShowLoadingScreen(false);
    }

    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData(getInitialFormData());
    setUploadedFile(null);
    setSubmittedData('');
    setAgentResponse(null);
    setValidationErrors({});
    setShowValidation(false);
    setApiStatus({
      sessionCreated: false,
      agentRun: false,
      errors: []
    });
    setShowResultsPage(false);
    setParsedResponse(null);
    setShowLoadingScreen(false);
    sessionStorage.removeItem('healthcareClaimForm');
  };

  const handleBackToForm = () => {
    setShowResultsPage(false);
    setParsedResponse(null);
  };

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
    setShowResultsPage(true);
  };



  // (Removed old full-screen LoadingScreen; we now show an overlay modal instead)

  // Show results page if available
  if (showResultsPage && parsedResponse) {
    return (
      <ResultsPage
        validationStatus={parsedResponse.validationStatus}
        results={parsedResponse.results}
        onBack={handleBackToForm}
        processingTime={parsedResponse.processingTime}
        agentMessages={parsedResponse.agentMessages}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Loading overlay modal */}
      <LoadingModal
        isOpen={showLoadingScreen}
        onComplete={handleLoadingComplete}
        awaitExternalComplete={true}
        isAgentDone={apiStatus.agentRun}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Claim Denial Predictor</h1>
          </div>
          <p className="text-lg text-gray-600">Predict denials before they happen – saving time, money, and effort.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF Upload */}
          <FileUpload
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onRemoveFile={handleRemoveFile}
          />

          {/* Billing Information */}
          <FormSection title="BILLING INFORMATION">
            <FormField
              label="ST Control Number"
              name="stControlNumber"
              value={formData.stControlNumber}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.stControlNumber}
              required
              validation={validationErrors.stControlNumber}
              showValidation={showValidation}
            />
            <FormField
              label="BHT Transaction ID"
              name="bhtTransactionId"
              value={formData.bhtTransactionId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.bhtTransactionId}
              required
              validation={validationErrors.bhtTransactionId}
              showValidation={showValidation}
            />
            <FormField
              label="BHT Date"
              name="bhtDate"
              value={formData.bhtDate}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              required
              validation={validationErrors.bhtDate}
              showValidation={showValidation}
            />
            <FormField
              label="BHT Time"
              name="bhtTime"
              value={formData.bhtTime}
              onChange={handleFieldChange}
              type="time"
              validation={validationErrors.bhtTime}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Submitter Information */}
          <FormSection title="SUBMITTER INFORMATION">
            <FormField
              label="Submitter Name"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.submitterName}
              required
              validation={validationErrors.submitterName}
              showValidation={showValidation}
            />
            <FormField
              label="Submitter ID"
              name="submitterId"
              value={formData.submitterId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.submitterId}
              required
              validation={validationErrors.submitterId}
              showValidation={showValidation}
            />
            <FormField
              label="Submitter Contact Name"
              name="submitterContactName"
              value={formData.submitterContactName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.submitterContactName}
              validation={validationErrors.submitterContactName}
              showValidation={showValidation}
            />
            <FormField
              label="Submitter Phone Number"
              name="submitterPhoneNumber"
              value={formData.submitterPhoneNumber}
              onChange={handleFieldChange}
              type="tel"
              placeholder={fieldPlaceholders.submitterPhoneNumber}
              validation={validationErrors.submitterPhoneNumber}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Receiver Information */}
          <FormSection title="RECEIVER INFORMATION">
            <FormField
              label="Receiver Name"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.receiverName}
              required
              validation={validationErrors.receiverName}
              showValidation={showValidation}
            />
            <FormField
              label="Receiver ID"
              name="receiverId"
              value={formData.receiverId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.receiverId}
              required
              validation={validationErrors.receiverId}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Billing Provider */}
          <FormSection title="BILLING PROVIDER">
            <FormField
              label="Provider Name"
              name="providerName"
              value={formData.providerName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerName}
              required
              validation={validationErrors.providerName}
              showValidation={showValidation}
            />
            <FormField
              label="Provider NPI"
              name="providerNpi"
              value={formData.providerNpi}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerNpi}
              required
              validation={validationErrors.providerNpi}
              showValidation={showValidation}
            />
            <FormField
              label="Provider EIN"
              name="providerEin"
              value={formData.providerEin}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerEin}
              required
              validation={validationErrors.providerEin}
              showValidation={showValidation}
            />
            <FormField
              label="Provider Address Line 1"
              name="providerAddressLine1"
              value={formData.providerAddressLine1}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerAddressLine1}
              required
              validation={validationErrors.providerAddressLine1}
              showValidation={showValidation}
            />
            <FormField
              label="Provider Address Line 2"
              name="providerAddressLine2"
              value={formData.providerAddressLine2}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerAddressLine2}
              validation={validationErrors.providerAddressLine2}
              showValidation={showValidation}
            />
            <FormField
              label="Provider City"
              name="providerCity"
              value={formData.providerCity}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerCity}
              required
              validation={validationErrors.providerCity}
              showValidation={showValidation}
            />
            <FormField
              label="Provider State"
              name="providerState"
              value={formData.providerState}
              onChange={handleFieldChange}
              fieldType="select"
              options={stateOptions}
              required
              validation={validationErrors.providerState}
              showValidation={showValidation}
            />
            <FormField
              label="Provider ZIP Code"
              name="providerZipCode"
              value={formData.providerZipCode}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerZipCode}
              required
              validation={validationErrors.providerZipCode}
              showValidation={showValidation}
            />
            <FormField
              label="Provider Contact Name"
              name="providerContactName"
              value={formData.providerContactName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.providerContactName}
              validation={validationErrors.providerContactName}
              showValidation={showValidation}
            />
            <FormField
              label="Provider Phone Number"
              name="providerPhoneNumber"
              value={formData.providerPhoneNumber}
              onChange={handleFieldChange}
              type="tel"
              placeholder={fieldPlaceholders.providerPhoneNumber}
              validation={validationErrors.providerPhoneNumber}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Subscriber / Patient Information */}
          <FormSection title="SUBSCRIBER / PATIENT INFORMATION">
            <FormField
              label="Subscriber First Name"
              name="subscriberFirstName"
              value={formData.subscriberFirstName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberFirstName}
              required
              validation={validationErrors.subscriberFirstName}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber Last Name"
              name="subscriberLastName"
              value={formData.subscriberLastName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberLastName}
              required
              validation={validationErrors.subscriberLastName}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber Member ID"
              name="subscriberMemberId"
              value={formData.subscriberMemberId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberMemberId}
              required
              validation={validationErrors.subscriberMemberId}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber Date of Birth"
              name="subscriberDateOfBirth"
              value={formData.subscriberDateOfBirth}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              required
              validation={validationErrors.subscriberDateOfBirth}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber Gender"
              name="subscriberGender"
              value={formData.subscriberGender}
              onChange={handleFieldChange}
              fieldType="select"
              options={genderOptions}
              required
              validation={validationErrors.subscriberGender}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber Address Line 1"
              name="subscriberAddressLine1"
              value={formData.subscriberAddressLine1}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberAddressLine1}
              required
              validation={validationErrors.subscriberAddressLine1}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber Address Line 2"
              name="subscriberAddressLine2"
              value={formData.subscriberAddressLine2}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberAddressLine2}
              validation={validationErrors.subscriberAddressLine2}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber City"
              name="subscriberCity"
              value={formData.subscriberCity}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberCity}
              required
              validation={validationErrors.subscriberCity}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber State"
              name="subscriberState"
              value={formData.subscriberState}
              onChange={handleFieldChange}
              fieldType="select"
              options={stateOptions}
              required
              validation={validationErrors.subscriberState}
              showValidation={showValidation}
            />
            <FormField
              label="Subscriber ZIP Code"
              name="subscriberZipCode"
              value={formData.subscriberZipCode}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.subscriberZipCode}
              required
              validation={validationErrors.subscriberZipCode}
              showValidation={showValidation}
            />
            <FormField
              label="Patient Relationship to Subscriber"
              name="patientRelationshipToSubscriber"
              value={formData.patientRelationshipToSubscriber}
              onChange={handleFieldChange}
              fieldType="select"
              options={relationshipOptions}
              required
              validation={validationErrors.patientRelationshipToSubscriber}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Payer Information */}
          <FormSection title="PAYER INFORMATION">
            <FormField
              label="Payer Name"
              name="payerName"
              value={formData.payerName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.payerName}
              required
              validation={validationErrors.payerName}
              showValidation={showValidation}
            />
            <FormField
              label="Payer ID"
              name="payerId"
              value={formData.payerId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.payerId}
              required
              validation={validationErrors.payerId}
              showValidation={showValidation}
            />
            <FormField
              label="Payer Type Code"
              name="payerTypeCode"
              value={formData.payerTypeCode}
              onChange={handleFieldChange}
              fieldType="select"
              options={payerTypeOptions}
              required
              validation={validationErrors.payerTypeCode}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Claim Information */}
          <FormSection title="CLAIM INFORMATION">
            <FormField
              label="Claim ID"
              name="claimId"
              value={formData.claimId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.claimId}
              required
              validation={validationErrors.claimId}
              showValidation={showValidation}
            />
            <FormField
              label="Total Charge Amount"
              name="totalChargeAmount"
              value={formData.totalChargeAmount}
              onChange={handleFieldChange}
              type="number"
              step="0.01"
              placeholder={fieldPlaceholders.totalChargeAmount}
              required
              validation={validationErrors.totalChargeAmount}
              showValidation={showValidation}
            />
            <FormField
              label="Place of Service Code"
              name="placeOfServiceCode"
              value={formData.placeOfServiceCode}
              onChange={handleFieldChange}
              fieldType="select"
              options={placeOfServiceOptions}
              required
              validation={validationErrors.placeOfServiceCode}
              showValidation={showValidation}
            />
            <FormField
              label="Claim Filing Indicator Code"
              name="claimFilingIndicatorCode"
              value={formData.claimFilingIndicatorCode}
              onChange={handleFieldChange}
              fieldType="select"
              options={claimFilingIndicatorOptions}
              required
              validation={validationErrors.claimFilingIndicatorCode}
              showValidation={showValidation}
            />
            <FormField
              label="Accept Assignment?"
              name="acceptAssignment"
              value={formData.acceptAssignment}
              onChange={handleFieldChange}
              fieldType="checkbox"
              required
              validation={validationErrors.acceptAssignment}
              showValidation={showValidation}
            />
            <FormField
              label="Benefits Assigned to Provider?"
              name="benefitsAssignedToProvider"
              value={formData.benefitsAssignedToProvider}
              onChange={handleFieldChange}
              fieldType="checkbox"
              required
              validation={validationErrors.benefitsAssignedToProvider}
              showValidation={showValidation}
            />
            <FormField
              label="Release of Information?"
              name="releaseOfInformation"
              value={formData.releaseOfInformation}
              onChange={handleFieldChange}
              fieldType="select"
              options={releaseOfInformationOptions}
              required
              validation={validationErrors.releaseOfInformation}
              showValidation={showValidation}
            />
            <FormField
              label="Service Date From"
              name="serviceDateFrom"
              value={formData.serviceDateFrom}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              required
              validation={validationErrors.serviceDateFrom}
              showValidation={showValidation}
            />
            <FormField
              label="Service Date To"
              name="serviceDateTo"
              value={formData.serviceDateTo}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              required
              validation={validationErrors.serviceDateTo}
              showValidation={showValidation}
            />
            <FormField
              label="Emergency Indicator"
              name="emergencyIndicator"
              value={formData.emergencyIndicator}
              onChange={handleFieldChange}
              fieldType="checkbox"
              validation={validationErrors.emergencyIndicator}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Diagnosis Information */}
          <FormSection title="DIAGNOSIS INFORMATION">
            <FormField
              label="Diagnosis Type"
              name="diagnosisType"
              value={formData.diagnosisType}
              onChange={handleFieldChange}
              fieldType="select"
              options={diagnosisTypeOptions}
              required
              validation={validationErrors.diagnosisType}
              showValidation={showValidation}
            />
            <FormField
              label="Primary Diagnosis Code"
              name="primaryDiagnosisCode"
              value={formData.primaryDiagnosisCode}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.primaryDiagnosisCode}
              required
              validation={validationErrors.primaryDiagnosisCode}
              showValidation={showValidation}
            />
            <FormField
              label="Additional Diagnosis Code 1"
              name="additionalDiagnosisCode1"
              value={formData.additionalDiagnosisCode1}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.additionalDiagnosisCode1}
              validation={validationErrors.additionalDiagnosisCode1}
              showValidation={showValidation}
            />
            <FormField
              label="Additional Diagnosis Code 2"
              name="additionalDiagnosisCode2"
              value={formData.additionalDiagnosisCode2}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.additionalDiagnosisCode2}
              validation={validationErrors.additionalDiagnosisCode2}
              showValidation={showValidation}
            />
            <FormField
              label="Additional Diagnosis Code 3"
              name="additionalDiagnosisCode3"
              value={formData.additionalDiagnosisCode3}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.additionalDiagnosisCode3}
              validation={validationErrors.additionalDiagnosisCode3}
              showValidation={showValidation}
            />
            <FormField
              label="Additional Diagnosis Code 4"
              name="additionalDiagnosisCode4"
              value={formData.additionalDiagnosisCode4}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.additionalDiagnosisCode4}
              validation={validationErrors.additionalDiagnosisCode4}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Rendering Provider Info */}
          <FormSection title="RENDERING PROVIDER INFO">
            <FormField
              label="Rendering Provider Name"
              name="renderingProviderName"
              value={formData.renderingProviderName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.renderingProviderName}
              required
              validation={validationErrors.renderingProviderName}
              showValidation={showValidation}
            />
            <FormField
              label="Rendering Provider NPI"
              name="renderingProviderNpi"
              value={formData.renderingProviderNpi}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.renderingProviderNpi}
              required
              validation={validationErrors.renderingProviderNpi}
              showValidation={showValidation}
            />
            <FormField
              label="Referring Provider Name"
              name="referringProviderName"
              value={formData.referringProviderName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.referringProviderName}
              validation={validationErrors.referringProviderName}
              showValidation={showValidation}
            />
            <FormField
              label="Referring Provider NPI"
              name="referringProviderNpi"
              value={formData.referringProviderNpi}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.referringProviderNpi}
              validation={validationErrors.referringProviderNpi}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Insurance Information */}
          <FormSection title="INSURANCE INFORMATION">
            <FormField
              label="Insurance Type"
              name="insuranceType"
              value={formData.insuranceType}
              onChange={handleFieldChange}
              fieldType="select"
              options={insuranceTypeOptions}
              required
              validation={validationErrors.insuranceType}
              showValidation={showValidation}
            />
            <FormField
              label="Group Number"
              name="groupNumber"
              value={formData.groupNumber}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.groupNumber}
              validation={validationErrors.groupNumber}
              showValidation={showValidation}
            />
            <FormField
              label="Policy Number"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.policyNumber}
              validation={validationErrors.policyNumber}
              showValidation={showValidation}
            />
            <FormField
              label="Prior Authorization Number"
              name="priorAuthorizationNumber"
              value={formData.priorAuthorizationNumber}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.priorAuthorizationNumber}
              validation={validationErrors.priorAuthorizationNumber}
              showValidation={showValidation}
            />
            <FormField
              label="Coverage Start Date"
              name="coverageStartDate"
              value={formData.coverageStartDate}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              validation={validationErrors.coverageStartDate}
              showValidation={showValidation}
            />
            <FormField
              label="Coverage End Date"
              name="coverageEndDate"
              value={formData.coverageEndDate}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              validation={validationErrors.coverageEndDate}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Service Lines */}
          <FormSection title="SERVICE LINES">
            <div className="col-span-full">
              <h3 className="text-md font-medium text-gray-800 mb-3">Service Line 1</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <FormField
                  label="Procedure Code (CPT/HCPCS)"
                  name="serviceLine1ProcedureCode"
                  value={formData.serviceLine1ProcedureCode}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine1ProcedureCode}
                  required
                  validation={validationErrors.serviceLine1ProcedureCode}
                  showValidation={showValidation}
                />
                <FormField
                  label="Modifier 1"
                  name="serviceLine1Modifier1"
                  value={formData.serviceLine1Modifier1}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine1Modifier1}
                  validation={validationErrors.serviceLine1Modifier1}
                  showValidation={showValidation}
                />
                <FormField
                  label="Modifier 2"
                  name="serviceLine1Modifier2"
                  value={formData.serviceLine1Modifier2}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine1Modifier2}
                  validation={validationErrors.serviceLine1Modifier2}
                  showValidation={showValidation}
                />
                {/* <div className="col-span-full">
                  <FormField
                    label="Diagnosis Pointer(s)"
                    name="serviceLine1DiagnosisPointer"
                    value={formData.serviceLine1DiagnosisPointer}
                    onChange={handleFieldChange}
                    fieldType="checkboxGroup"
                    options={diagnosisPointerOptions}
                    required
                    validation={validationErrors.serviceLine1DiagnosisPointer}
                    showValidation={showValidation}
                  />
                </div> */}
                <FormField
                  label="Charge Amount"
                  name="serviceLine1ChargeAmount"
                  value={formData.serviceLine1ChargeAmount}
                  onChange={handleFieldChange}
                  type="number"
                  step="0.01"
                  placeholder={fieldPlaceholders.serviceLine1ChargeAmount}
                  required
                  validation={validationErrors.serviceLine1ChargeAmount}
                  showValidation={showValidation}
                />
                <FormField
                  label="Quantity"
                  name="serviceLine1Quantity"
                  value={formData.serviceLine1Quantity}
                  onChange={handleFieldChange}
                  type="number"
                  placeholder={fieldPlaceholders.serviceLine1Quantity}
                  required
                  validation={validationErrors.serviceLine1Quantity}
                  showValidation={showValidation}
                />
                <FormField
                  label="Unit of Measure"
                  name="serviceLine1UnitOfMeasure"
                  value={formData.serviceLine1UnitOfMeasure}
                  onChange={handleFieldChange}
                  fieldType="select"
                  options={unitOfMeasureOptions}
                />
                <FormField
                  label="Service Date"
                  name="serviceLine1ServiceDate"
                  value={formData.serviceLine1ServiceDate}
                  onChange={handleFieldChange}
                  type="date"
                  fieldType="date"
                  required
                  validation={validationErrors.serviceLine1ServiceDate}
                  showValidation={showValidation}
                />
                <FormField
                  label="Place of Service"
                  name="serviceLine1PlaceOfService"
                  value={formData.serviceLine1PlaceOfService}
                  onChange={handleFieldChange}
                  fieldType="select"
                  options={placeOfServiceOptions}
                  validation={validationErrors.serviceLine1PlaceOfService}
                  showValidation={showValidation}
                />
                <FormField
                  label="Emergency Service?"
                  name="serviceLine1EmergencyService"
                  value={formData.serviceLine1EmergencyService}
                  onChange={handleFieldChange}
                  fieldType="checkbox"
                  validation={validationErrors.serviceLine1EmergencyService}
                  showValidation={showValidation}
                />
                <FormField
                  label="Rendering Provider NPI"
                  name="serviceLine1RenderingProviderNpi"
                  value={formData.serviceLine1RenderingProviderNpi}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine1RenderingProviderNpi}
                  validation={validationErrors.serviceLine1RenderingProviderNpi}
                  showValidation={showValidation}
                />
              </div>

              <h3 className="text-md font-medium text-gray-800 mb-3">Service Line 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  label="Procedure Code (CPT/HCPCS)"
                  name="serviceLine2ProcedureCode"
                  value={formData.serviceLine2ProcedureCode}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine2ProcedureCode}
                  validation={validationErrors.serviceLine2ProcedureCode}
                  showValidation={showValidation}
                />
                <FormField
                  label="Modifier 1"
                  name="serviceLine2Modifier1"
                  value={formData.serviceLine2Modifier1}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine2Modifier1}
                  validation={validationErrors.serviceLine2Modifier1}
                  showValidation={showValidation}
                />
                <FormField
                  label="Modifier 2"
                  name="serviceLine2Modifier2"
                  value={formData.serviceLine2Modifier2}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine2Modifier2}
                  validation={validationErrors.serviceLine2Modifier2}
                  showValidation={showValidation}
                />
                {/* <div className="col-span-full">
                  <FormField
                    label="Diagnosis Pointer(s)"
                    name="serviceLine2DiagnosisPointer"
                    value={formData.serviceLine2DiagnosisPointer}
                    onChange={handleFieldChange}
                    fieldType="checkboxGroup"
                    options={diagnosisPointerOptions}
                    validation={validationErrors.serviceLine2DiagnosisPointer}
                    showValidation={showValidation}
                  />
                </div> */}
                <FormField
                  label="Charge Amount"
                  name="serviceLine2ChargeAmount"
                  value={formData.serviceLine2ChargeAmount}
                  onChange={handleFieldChange}
                  type="number"
                  step="0.01"
                  placeholder={fieldPlaceholders.serviceLine2ChargeAmount}
                  validation={validationErrors.serviceLine2ChargeAmount}
                  showValidation={showValidation}
                />
                <FormField
                  label="Quantity"
                  name="serviceLine2Quantity"
                  value={formData.serviceLine2Quantity}
                  onChange={handleFieldChange}
                  type="number"
                  placeholder={fieldPlaceholders.serviceLine2Quantity}
                  validation={validationErrors.serviceLine2Quantity}
                  showValidation={showValidation}
                />
                <FormField
                  label="Unit of Measure"
                  name="serviceLine2UnitOfMeasure"
                  value={formData.serviceLine2UnitOfMeasure}
                  onChange={handleFieldChange}
                  fieldType="select"
                  options={unitOfMeasureOptions}
                />
                <FormField
                  label="Service Date"
                  name="serviceLine2ServiceDate"
                  value={formData.serviceLine2ServiceDate}
                  onChange={handleFieldChange}
                  type="date"
                  fieldType="date"
                  validation={validationErrors.serviceLine2ServiceDate}
                  showValidation={showValidation}
                />
                <FormField
                  label="Place of Service"
                  name="serviceLine2PlaceOfService"
                  value={formData.serviceLine2PlaceOfService}
                  onChange={handleFieldChange}
                  fieldType="select"
                  options={placeOfServiceOptions}
                  validation={validationErrors.serviceLine2PlaceOfService}
                  showValidation={showValidation}
                />
                <FormField
                  label="Emergency Service?"
                  name="serviceLine2EmergencyService"
                  value={formData.serviceLine2EmergencyService}
                  onChange={handleFieldChange}
                  fieldType="checkbox"
                  validation={validationErrors.serviceLine2EmergencyService}
                  showValidation={showValidation}
                />
                <FormField
                  label="Rendering Provider NPI"
                  name="serviceLine2RenderingProviderNpi"
                  value={formData.serviceLine2RenderingProviderNpi}
                  onChange={handleFieldChange}
                  placeholder={fieldPlaceholders.serviceLine2RenderingProviderNpi}
                  validation={validationErrors.serviceLine2RenderingProviderNpi}
                  showValidation={showValidation}
                />
              </div>
            </div>
          </FormSection>

          {/* Claim Attachments */}
          <FormSection title="CLAIM ATTACHMENTS">
            <FormField
              label="Attachment Control Number"
              name="attachmentControlNumber"
              value={formData.attachmentControlNumber}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.attachmentControlNumber}
              validation={validationErrors.attachmentControlNumber}
              showValidation={showValidation}
            />
            <FormField
              label="Attachment Type Code"
              name="attachmentTypeCode"
              value={formData.attachmentTypeCode}
              onChange={handleFieldChange}
              fieldType="select"
              options={attachmentTypeOptions}
              validation={validationErrors.attachmentTypeCode}
              showValidation={showValidation}
            />
            <FormField
              label="Attachment Transmission Method"
              name="attachmentTransmissionMethod"
              value={formData.attachmentTransmissionMethod}
              onChange={handleFieldChange}
              fieldType="select"
              options={attachmentTransmissionOptions}
              validation={validationErrors.attachmentTransmissionMethod}
              showValidation={showValidation}
            />
            <FormField
              label="Attachment Description"
              name="attachmentDescription"
              value={formData.attachmentDescription}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.attachmentDescription}
              validation={validationErrors.attachmentDescription}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Other Insurance Info */}
          <FormSection title="OTHER INSURANCE INFO">
            <FormField
              label="Other Payer Name"
              name="otherPayerName"
              value={formData.otherPayerName}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.otherPayerName}
              validation={validationErrors.otherPayerName}
              showValidation={showValidation}
            />
            <FormField
              label="Other Payer ID"
              name="otherPayerId"
              value={formData.otherPayerId}
              onChange={handleFieldChange}
              placeholder={fieldPlaceholders.otherPayerId}
              validation={validationErrors.otherPayerId}
              showValidation={showValidation}
            />
            <FormField
              label="Other Payer Responsibility Code"
              name="otherPayerResponsibilityCode"
              value={formData.otherPayerResponsibilityCode}
              onChange={handleFieldChange}
              fieldType="select"
              options={otherPayerResponsibilityOptions}
              validation={validationErrors.otherPayerResponsibilityCode}
              showValidation={showValidation}
            />
            <FormField
              label="Other Insurance Paid Amount"
              name="otherInsurancePaidAmount"
              value={formData.otherInsurancePaidAmount}
              onChange={handleFieldChange}
              type="number"
              step="0.01"
              placeholder={fieldPlaceholders.otherInsurancePaidAmount}
              validation={validationErrors.otherInsurancePaidAmount}
              showValidation={showValidation}
            />
            <FormField
              label="Other Insurance Coverage Active?"
              name="otherInsuranceCoverageActive"
              value={formData.otherInsuranceCoverageActive}
              onChange={handleFieldChange}
              fieldType="checkbox"
              validation={validationErrors.otherInsuranceCoverageActive}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Notes */}
          <FormSection title="NOTES">
            <FormField
              label="Claim Note Code"
              name="claimNoteCode"
              value={formData.claimNoteCode}
              onChange={handleFieldChange}
              fieldType="select"
              options={claimNoteOptions}
              validation={validationErrors.claimNoteCode}
              showValidation={showValidation}
            />
            <div className="col-span-full">
              <FormField
                label="Claim Notes"
                name="claimNotes"
                value={formData.claimNotes}
                onChange={handleFieldChange}
                fieldType="textarea"
                placeholder={fieldPlaceholders.claimNotes}
                validation={validationErrors.claimNotes}
                showValidation={showValidation}
              />
            </div>
          </FormSection>

          {/* Declaration & Authorization */}
          <FormSection title="DECLARATION & AUTHORIZATION">
            <FormField
              label="Patient Signature on File"
              name="patientSignatureOnFile"
              value={formData.patientSignatureOnFile}
              onChange={handleFieldChange}
              fieldType="checkbox"
              required
              validation={validationErrors.patientSignatureOnFile}
              showValidation={showValidation}
            />
            <FormField
              label="Provider Signature on File"
              name="providerSignatureOnFile"
              value={formData.providerSignatureOnFile}
              onChange={handleFieldChange}
              fieldType="checkbox"
              required
              validation={validationErrors.providerSignatureOnFile}
              showValidation={showValidation}
            />
            <FormField
              label="Date Signed"
              name="dateSigned"
              value={formData.dateSigned}
              onChange={handleFieldChange}
              type="date"
              fieldType="date"
              required
              validation={validationErrors.dateSigned}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Acknowledgment */}
          <FormSection title="ACKNOWLEDGMENT">
            <FormField
              label="I confirm the above information is accurate"
              name="confirmAccurate"
              value={formData.confirmAccurate}
              onChange={handleFieldChange}
              fieldType="checkbox"
              required
              validation={validationErrors.confirmAccurate}
              showValidation={showValidation}
            />
          </FormSection>

          {/* Validation Summary */}
          {showValidation && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Validation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{validationSummary.totalFields}</div>
                  <div className="text-sm text-blue-700">Total Fields</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validationSummary.validFields}</div>
                  <div className="text-sm text-green-700">Post-Submission Updates</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{validationSummary.invalidFields}</div>
                  <div className="text-sm text-red-700">Invalid Fields</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{validationSummary.requiredFields}</div>
                  <div className="text-sm text-yellow-700">Required Fields</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{validationSummary.completedRequired}</div>
                  <div className="text-sm text-purple-700">Completed Required</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Form Completion</span>
                  <span>{Math.round((validationSummary.completedRequired / validationSummary.requiredFields) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(validationSummary.completedRequired / validationSummary.requiredFields) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Error List */}
              {validationSummary.invalidFields > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">Fields with Errors:</h4>
                  <div className="space-y-1">
                    {Object.entries(validationErrors)
                      .filter(([_, result]) => !result.isValid)
                      .map(([fieldName, result]) => (
                        <div key={fieldName} className="text-sm text-red-600 flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {result.message}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Form
                </button>

                <button
                  type="button"
                  onClick={() => setShowValidation(!showValidation)}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors ${showValidation
                    ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {showValidation ? 'Hide Validation' : 'Show Validation'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || validationSummary.invalidFields > 0}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition-colors ${validationSummary.invalidFields > 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </div>


        </form>
      </div>
    </div>
  );
}

export default App;
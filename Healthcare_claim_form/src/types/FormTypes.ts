export interface FormData {
  // Billing Information
  stControlNumber: string;
  bhtTransactionId: string;
  bhtDate: string;
  bhtTime: string;

  // Submitter Information
  submitterName: string;
  submitterId: string;
  submitterContactName: string;
  submitterPhoneNumber: string;

  // Receiver Information
  receiverName: string;
  receiverId: string;

  // Billing Provider
  providerName: string;
  providerNpi: string;
  providerEin: string;
  providerAddressLine1: string;
  providerAddressLine2: string;
  providerCity: string;
  providerState: string;
  providerZipCode: string;
  providerContactName: string;
  providerPhoneNumber: string;

  // Subscriber / Patient Information
  subscriberFirstName: string;
  subscriberLastName: string;
  subscriberMemberId: string;
  subscriberDateOfBirth: string;
  subscriberGender: string;
  subscriberAddressLine1: string;
  subscriberAddressLine2: string;
  subscriberCity: string;
  subscriberState: string;
  subscriberZipCode: string;
  patientRelationshipToSubscriber: string;

  // Payer Information
  payerName: string;
  payerId: string;
  payerTypeCode: string;

  // Claim Information
  claimId: string;
  totalChargeAmount: string;
  placeOfServiceCode: string;
  claimFilingIndicatorCode: string;
  acceptAssignment: boolean;
  benefitsAssignedToProvider: boolean;
  releaseOfInformation: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  emergencyIndicator: boolean;

  // Diagnosis Information
  diagnosisType: string;
  primaryDiagnosisCode: string;
  additionalDiagnosisCode1: string;
  additionalDiagnosisCode2: string;
  additionalDiagnosisCode3: string;
  additionalDiagnosisCode4: string;

  // Rendering Provider Info
  renderingProviderName: string;
  renderingProviderNpi: string;
  referringProviderName: string;
  referringProviderNpi: string;

  // Insurance Information
  insuranceType: string;
  groupNumber: string;
  policyNumber: string;
  priorAuthorizationNumber: string;
  coverageStartDate: string;
  coverageEndDate: string;

  // Service Lines
  serviceLine1ProcedureCode: string;
  serviceLine1Modifier1: string;
  serviceLine1Modifier2: string;
  serviceLine1DiagnosisPointer: string[];
  serviceLine1ChargeAmount: string;
  serviceLine1Quantity: string;
  serviceLine1UnitOfMeasure: string;
  serviceLine1ServiceDate: string;
  serviceLine1PlaceOfService: string;
  serviceLine1EmergencyService: boolean;
  serviceLine1RenderingProviderNpi: string;

  serviceLine2ProcedureCode: string;
  serviceLine2Modifier1: string;
  serviceLine2Modifier2: string;
  serviceLine2DiagnosisPointer: string[];
  serviceLine2ChargeAmount: string;
  serviceLine2Quantity: string;
  serviceLine2UnitOfMeasure: string;
  serviceLine2ServiceDate: string;
  serviceLine2PlaceOfService: string;
  serviceLine2EmergencyService: boolean;
  serviceLine2RenderingProviderNpi: string;

  // Claim Attachments
  attachmentControlNumber: string;
  attachmentTypeCode: string;
  attachmentTransmissionMethod: string;
  attachmentDescription: string;

  // Other Insurance Info
  otherPayerName: string;
  otherPayerId: string;
  otherPayerResponsibilityCode: string;
  otherInsurancePaidAmount: string;
  otherInsuranceCoverageActive: boolean;

  // Notes
  claimNoteCode: string;
  claimNotes: string;

  // Declaration & Authorization
  patientSignatureOnFile: boolean;
  providerSignatureOnFile: boolean;
  dateSigned: string;

  // Acknowledgment
  confirmAccurate: boolean;
}

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  name: string;
  value: string | boolean | string[];
  onChange: (name: string, value: string | boolean | string[]) => void;
  type?: string;
  required?: boolean;
  options?: Array<{ value: string, label: string }>;
  placeholder?: string;
  className?: string;
  fieldType?: 'text' | 'select' | 'checkbox' | 'textarea' | 'date' | 'checkboxGroup';
  step?: string; // Added for number input fields
}

export interface CheckboxGroupProps {
  label: string;
  name: string;
  value: string[];
  onChange: (name: string, value: string[]) => void;
  options: Array<{ value: string, label: string }>;
  required?: boolean;
  className?: string;
}
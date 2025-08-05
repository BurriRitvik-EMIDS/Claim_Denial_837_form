import { FormData } from '../types/FormTypes';

export const getInitialFormData = (): FormData => ({
  stControlNumber: '',
  bhtTransactionId: '',
  bhtDate: '',
  bhtTime: '',
  submitterName: '',
  submitterId: '',
  submitterContactName: '',
  submitterPhoneNumber: '',
  receiverName: '',
  receiverId: '',
  providerName: '',
  providerNpi: '',
  providerEin: '',
  providerAddressLine1: '',
  providerAddressLine2: '',
  providerCity: '',
  providerState: '',
  providerZipCode: '',
  providerContactName: '',
  providerPhoneNumber: '',
  subscriberFirstName: '',
  subscriberLastName: '',
  subscriberMemberId: '',
  subscriberDateOfBirth: '',
  subscriberGender: '',
  subscriberAddressLine1: '',
  subscriberAddressLine2: '',
  subscriberCity: '',
  subscriberState: '',
  subscriberZipCode: '',
  patientRelationshipToSubscriber: '',
  payerName: '',
  payerId: '',
  payerTypeCode: '',
  claimId: '',
  totalChargeAmount: '',
  placeOfServiceCode: '',
  claimFilingIndicatorCode: '',
  acceptAssignment: false,
  benefitsAssignedToProvider: false,
  releaseOfInformation: '',
  serviceDateFrom: '',
  serviceDateTo: '',
  emergencyIndicator: false,
  diagnosisType: '',
  primaryDiagnosisCode: '',
  additionalDiagnosisCode1: '',
  additionalDiagnosisCode2: '',
  additionalDiagnosisCode3: '',
  additionalDiagnosisCode4: '',
  renderingProviderName: '',
  renderingProviderNpi: '',
  referringProviderName: '',
  referringProviderNpi: '',
  insuranceType: '',
  groupNumber: '',
  policyNumber: '',
  priorAuthorizationNumber: '',
  coverageStartDate: '',
  coverageEndDate: '',
  serviceLine1ProcedureCode: '',
  serviceLine1Modifier1: '',
  serviceLine1Modifier2: '',
  serviceLine1DiagnosisPointer: [],
  serviceLine1ChargeAmount: '',
  serviceLine1Quantity: '',
  serviceLine1UnitOfMeasure: '',
  serviceLine1ServiceDate: '',
  serviceLine1PlaceOfService: '',
  serviceLine1EmergencyService: false,
  serviceLine1RenderingProviderNpi: '',
  serviceLine2ProcedureCode: '',
  serviceLine2Modifier1: '',
  serviceLine2Modifier2: '',
  serviceLine2DiagnosisPointer: [],
  serviceLine2ChargeAmount: '',
  serviceLine2Quantity: '',
  serviceLine2UnitOfMeasure: '',
  serviceLine2ServiceDate: '',
  serviceLine2PlaceOfService: '',
  serviceLine2EmergencyService: false,
  serviceLine2RenderingProviderNpi: '',
  attachmentControlNumber: '',
  attachmentTypeCode: '',
  attachmentTransmissionMethod: '',
  attachmentDescription: '',
  otherPayerName: '',
  otherPayerId: '',
  otherPayerResponsibilityCode: '',
  otherInsurancePaidAmount: '',
  otherInsuranceCoverageActive: false,
  claimNoteCode: '',
  claimNotes: '',
  patientSignatureOnFile: false,
  providerSignatureOnFile: false,
  dateSigned: '',
  confirmAccurate: false
});



export const saveFormToSession = (formData: FormData) => {
  sessionStorage.setItem('healthcareClaimForm', JSON.stringify(formData));
};

export const loadFormFromSession = (): FormData | null => {
  const saved = sessionStorage.getItem('healthcareClaimForm');
  return saved ? JSON.parse(saved) : null;
};

// Field options
export const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Unknown', label: 'Unknown' }
];

export const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

export const relationshipOptions = [
  { value: 'Self', label: 'Self' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Grandchild', label: 'Grandchild' },
  { value: 'Niece/Nephew', label: 'Niece/Nephew' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Unknown', label: 'Unknown' },
  { value: 'Other', label: 'Other' }
];

export const payerTypeOptions = [
  { value: 'CI', label: 'CI - Commercial Insurance' },
  { value: 'MB', label: 'MB - Medicare Part B' },
  { value: 'MA', label: 'MA - Medicare Advantage' },
  { value: 'MC', label: 'MC - Medicaid' },
  { value: 'CH', label: 'CH - Champus' },
  { value: 'OF', label: 'OF - Other Federal Program' },
  { value: 'TV', label: 'TV - Title V' },
  { value: 'VA', label: 'VA - Veterans Affairs' },
  { value: 'WC', label: 'WC - Workers\' Compensation' },
  { value: 'ZZ', label: 'ZZ - Mutual Insurance' }
];

export const placeOfServiceOptions = [
  { value: '01', label: '01 - Pharmacy' },
  { value: '02', label: '02 - Telehealth' },
  { value: '03', label: '03 - School' },
  { value: '04', label: '04 - Homeless Shelter' },
  { value: '05', label: '05 - Indian Health Service Free-standing Facility' },
  { value: '06', label: '06 - Indian Health Service Provider-based Facility' },
  { value: '07', label: '07 - Tribal 638 Free-standing Facility' },
  { value: '08', label: '08 - Tribal 638 Provider-based Facility' },
  { value: '11', label: '11 - Office' },
  { value: '12', label: '12 - Home' },
  { value: '13', label: '13 - Assisted Living Facility' },
  { value: '14', label: '14 - Group Home' },
  { value: '15', label: '15 - Mobile Unit' },
  { value: '16', label: '16 - Temporary Lodging' },
  { value: '17', label: '17 - Walk-in Retail Health Clinic' },
  { value: '18', label: '18 - Place of Employment-Worksite' },
  { value: '19', label: '19 - Off Campus-Outpatient Hospital' },
  { value: '20', label: '20 - Urgent Care Facility' },
  { value: '21', label: '21 - Inpatient Hospital' },
  { value: '22', label: '22 - On Campus-Outpatient Hospital' },
  { value: '23', label: '23 - Emergency Room-Hospital' },
  { value: '24', label: '24 - Ambulatory Surgical Center' },
  { value: '25', label: '25 - Birthing Center' },
  { value: '26', label: '26 - Military Treatment Facility' },
  { value: '31', label: '31 - Skilled Nursing Facility' },
  { value: '32', label: '32 - Nursing Facility' },
  { value: '33', label: '33 - Custodial Care Facility' },
  { value: '34', label: '34 - Hospice' },
  { value: '41', label: '41 - Ambulance-Land' },
  { value: '42', label: '42 - Ambulance-Air or Water' },
  { value: '49', label: '49 - Independent Clinic' },
  { value: '50', label: '50 - FQHC' },
  { value: '51', label: '51 - Inpatient Psych Facility' },
  { value: '52', label: '52 - Psych Facility Partial Hospitalization' },
  { value: '53', label: '53 - Community Mental Health Center' },
  { value: '54', label: '54 - Intermediate Care for Mentally Retarded' },
  { value: '55', label: '55 - Residential Substance Abuse' },
  { value: '56', label: '56 - Psych Residential Treatment Center' },
  { value: '57', label: '57 - Non-residential Substance Abuse Facility' },
  { value: '60', label: '60 - Mass Immunization Center' },
  { value: '61', label: '61 - Comprehensive Inpatient Rehab' },
  { value: '62', label: '62 - Comprehensive Outpatient Rehab' },
  { value: '65', label: '65 - End-Stage Renal Disease Facility' },
  { value: '71', label: '71 - State/Local Public Health Clinic' },
  { value: '72', label: '72 - Rural Health Clinic' },
  { value: '81', label: '81 - Independent Lab' },
  { value: '99', label: '99 - Other' }
];

export const claimFilingIndicatorOptions = [
  { value: 'MB', label: 'MB - Medicare Part B' },
  { value: 'MC', label: 'MC - Medicaid' },
  { value: 'CH', label: 'CH - Champus' },
  { value: 'CI', label: 'CI - Commercial Insurance' },
  { value: 'BL', label: 'BL - Blue Cross/Blue Shield' },
  { value: 'MA', label: 'MA - Medicare Advantage' },
  { value: 'FI', label: 'FI - Federal Employees Program' },
  { value: 'HM', label: 'HM - HMO' },
  { value: 'OF', label: 'OF - Other Federal Program' },
  { value: 'VA', label: 'VA - Veterans Affairs' },
  { value: 'WC', label: 'WC - Workers\' Compensation' },
  { value: 'ZZ', label: 'ZZ - Mutually Defined' }
];

export const releaseOfInformationOptions = [
  { value: 'Y', label: 'Y - Yes' },
  { value: 'I', label: 'I - Informed Consent to Release' },
  { value: 'N', label: 'N - No' }
];

export const diagnosisTypeOptions = [
  { value: 'ICD-10-CM', label: 'ICD-10-CM' },
  { value: 'ICD-9-CM', label: 'ICD-9-CM' }
];

export const insuranceTypeOptions = [
  { value: '12', label: '12 - Preferred Provider Organization (PPO)' },
  { value: '13', label: '13 - Health Maintenance Organization (HMO)' },
  { value: '14', label: '14 - Exclusive Provider Organization (EPO)' },
  { value: '15', label: '15 - Indemnity Insurance' },
  { value: '16', label: '16 - Self-funded' },
  { value: '17', label: '17 - State-funded' },
  { value: '18', label: '18 - Employer Sponsored' },
  { value: '19', label: '19 - Individual Market' },
  { value: '20', label: '20 - Marketplace Qualified Plan' }
];

export const unitOfMeasureOptions = [
  { value: 'UN', label: 'UN - Units' },
  { value: 'MJ', label: 'MJ - Minutes' },
  { value: 'ML', label: 'ML - Milliliters' },
  { value: 'GR', label: 'GR - Grams' },
  { value: 'LT', label: 'LT - Liters' },
  { value: 'ME', label: 'ME - Meal' },
  { value: 'MR', label: 'MR - Meter' },
  { value: 'OR', label: 'OR - Oral' },
  { value: 'SH', label: 'SH - Sheets' }
];

export const attachmentTypeOptions = [
  { value: 'OZ', label: 'OZ - Support Data for Claim' },
  { value: 'B2', label: 'B2 - Referral Form' },
  { value: 'EB', label: 'EB - Explanation of Benefits' },
  { value: '04', label: '04 - Clinical Test Results' },
  { value: '06', label: '06 - Initial Assessment' },
  { value: '11', label: '11 - Functional Goal' },
  { value: '13', label: '13 - Treatment Plan' },
  { value: '21', label: '21 - Physician Orders' }
];

export const attachmentTransmissionOptions = [
  { value: 'AA', label: 'AA - Available on Request at Provider Site' },
  { value: 'BM', label: 'BM - By Mail' },
  { value: 'EL', label: 'EL - Electronically Only' },
  { value: 'EM', label: 'EM - Email' },
  { value: 'FX', label: 'FX - Fax' },
  { value: 'FT', label: 'FT - FTP' },
  { value: 'NS', label: 'NS - No Submission Required' },
  { value: 'ON', label: 'ON - Online' }
];

export const otherPayerResponsibilityOptions = [
  { value: 'P', label: 'P - Primary' },
  { value: 'S', label: 'S - Secondary' },
  { value: 'T', label: 'T - Tertiary' }
];

export const claimNoteOptions = [
  { value: 'ADD', label: 'ADD - Additional Information' },
  { value: 'TPO', label: 'TPO - Third Party Obligation' },
  { value: 'DCP', label: 'DCP - Delay Code Reason' }
];

export const diagnosisPointerOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' }
];

// Placeholder mappings for form fields
export const fieldPlaceholders: Record<string, string> = {
  // Billing Information
  stControlNumber: 'e.g., 0003',
  bhtTransactionId: 'e.g., TRX123456789',
  bhtDate: 'YYYY-MM-DD',
  bhtTime: 'HH:MM',

  // Submitter Information
  submitterName: 'e.g., Medical Group LLC',
  submitterId: 'e.g., SUB123456',
  submitterContactName: 'e.g., John Smith',
  submitterPhoneNumber: 'e.g., (555) 123-4567',

  // Receiver Information
  receiverName: 'e.g., Insurance Company Name',
  receiverId: 'e.g., REC987654',

  // Billing Provider
  providerName: 'e.g., Dr. Jane Doe Medical Practice',
  providerNpi: 'e.g., 1234567890 (10 digits)',
  providerEin: 'e.g., 123456789',
  providerAddressLine1: 'e.g., 123 Medical Center Dr',
  providerAddressLine2: 'e.g., Suite 100 (optional)',
  providerCity: 'e.g., Anytown',
  providerState: 'Select state',
  providerZipCode: 'e.g., 12345 or 12345-6789',
  providerContactName: 'e.g., Dr. Jane Doe',
  providerPhoneNumber: 'e.g., (555) 987-6543',

  // Subscriber/Patient Information
  subscriberFirstName: 'e.g., John',
  subscriberLastName: 'e.g., Smith',
  subscriberMemberId: 'e.g., MEM123456789',
  subscriberDateOfBirth: 'YYYY-MM-DD',
  subscriberGender: 'Select gender',
  subscriberAddressLine1: 'e.g., 456 Patient St',
  subscriberAddressLine2: 'e.g., Apt 2B (optional)',
  subscriberCity: 'e.g., Patient City',
  subscriberState: 'Select state',
  subscriberZipCode: 'e.g., 54321 or 54321-9876',
  patientRelationshipToSubscriber: 'Select relationship',

  // Payer Information
  payerName: 'e.g., Blue Cross Blue Shield',
  payerId: 'e.g., PAY123456',
  payerTypeCode: 'Select payer type',

  // Claim Information
  claimId: 'e.g., CLM987654321',
  totalChargeAmount: 'e.g., 150.00',
  placeOfServiceCode: 'Select place of service',
  claimFilingIndicatorCode: 'Select filing indicator',
  releaseOfInformation: 'Select release option',
  serviceDateFrom: 'YYYY-MM-DD',
  serviceDateTo: 'YYYY-MM-DD',

  // Diagnosis Information
  diagnosisType: 'Select diagnosis type',
  primaryDiagnosisCode: 'e.g., E11.9 (ICD-10)',
  additionalDiagnosisCode1: 'e.g., I10 (ICD-10)',
  additionalDiagnosisCode2: 'e.g., Z51.11 (ICD-10)',
  additionalDiagnosisCode3: 'e.g., Z79.4 (ICD-10)',
  additionalDiagnosisCode4: 'e.g., Z51.81 (ICD-10)',

  // Rendering Provider Info
  renderingProviderName: 'e.g., Dr. Sarah Johnson',
  renderingProviderNpi: 'e.g., 0987654321 (10 digits)',
  referringProviderName: 'e.g., Dr. Michael Brown',
  referringProviderNpi: 'e.g., 1122334455 (10 digits)',

  // Insurance Information
  insuranceType: 'Select insurance type',
  groupNumber: 'e.g., GRP123456',
  policyNumber: 'e.g., POL987654',
  priorAuthorizationNumber: 'e.g., AUTH123456',
  coverageStartDate: 'YYYY-MM-DD',
  coverageEndDate: 'YYYY-MM-DD',

  // Service Lines
  serviceLine1ProcedureCode: 'e.g., 99213 (CPT) or G0008 (HCPCS)',
  serviceLine1Modifier1: 'e.g., 25, 59, 76',
  serviceLine1Modifier2: 'e.g., 25, 59, 76',
  serviceLine1ChargeAmount: 'e.g., 75.00',
  serviceLine1Quantity: 'e.g., 1',
  serviceLine1UnitOfMeasure: 'Select unit of measure',
  serviceLine1ServiceDate: 'YYYY-MM-DD',
  serviceLine1PlaceOfService: 'Select place of service',
  serviceLine1RenderingProviderNpi: 'e.g., 0987654321 (10 digits)',

  serviceLine2ProcedureCode: 'e.g., 36415 (CPT) or G0008 (HCPCS)',
  serviceLine2Modifier1: 'e.g., 25, 59, 76',
  serviceLine2Modifier2: 'e.g., 25, 59, 76',
  serviceLine2ChargeAmount: 'e.g., 45.00',
  serviceLine2Quantity: 'e.g., 1',
  serviceLine2UnitOfMeasure: 'Select unit of measure',
  serviceLine2ServiceDate: 'YYYY-MM-DD',
  serviceLine2PlaceOfService: 'Select place of service',
  serviceLine2RenderingProviderNpi: 'e.g., 0987654321 (10 digits)',

  // Claim Attachments
  attachmentControlNumber: 'e.g., ATT123456789',
  attachmentTypeCode: 'Select attachment type',
  attachmentTransmissionMethod: 'Select transmission method',
  attachmentDescription: 'e.g., Lab results, X-ray images, etc.',

  // Other Insurance Info
  otherPayerName: 'e.g., Secondary Insurance Co',
  otherPayerId: 'e.g., OTH654321',
  otherPayerResponsibilityCode: 'Select responsibility code',
  otherInsurancePaidAmount: 'e.g., 50.00',

  // Notes
  claimNoteCode: 'Select note code',
  claimNotes: 'Enter any additional notes or special instructions...',

  // Declaration & Authorization
  dateSigned: 'YYYY-MM-DD'
};

// Validation rules and functions
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  message: string | null;
}

export const validationRules: Record<string, ValidationRule> = {
  // Billing Information
  stControlNumber: {
    required: true,
    minLength: 1,
    maxLength: 50,
    custom: (value) => {
      if (!value.trim()) {
        return 'ST Control Number is required. Please enter a value.';
      }
      return null;
    }
  },
  bhtTransactionId: {
    required: true,
    minLength: 1,
    maxLength: 50
  },
  bhtDate: {
    required: true,
    custom: (value) => {
      if (!value) return 'Date is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Invalid date format';
      if (date > new Date()) return 'Date cannot be in the future';
      return null;
    }
  },
  bhtTime: {
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    custom: (value) => {
      if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
        return 'Time must be in HH:MM format';
      }
      return null;
    }
  },

  // Submitter Information
  submitterName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  submitterId: {
    required: true,
    minLength: 1,
    maxLength: 50
  },
  submitterContactName: {
    minLength: 2,
    maxLength: 100
  },
  submitterPhoneNumber: {
    pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    custom: (value) => {
      if (value && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)) {
        return 'Phone number must be in format (555) 123-4567';
      }
      return null;
    }
  },

  // Receiver Information
  receiverName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  receiverId: {
    required: true,
    minLength: 1,
    maxLength: 50
  },

  // Billing Provider
  providerName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  providerNpi: {
    required: true,
    pattern: /^\d{10}$/,
    custom: (value) => {
      if (!/^\d{10}$/.test(value)) {
        return 'NPI must be exactly 10 digits';
      }
      return null;
    }
  },
  providerEin: {
    required: true,
    pattern: /^\d{9}$/,
    custom: (value) => {
      if (!/^\d{9}$/.test(value)) {
        return 'EIN must be exactly 9 digits (e.g., 123456789)';
      }
      return null;
    }
  },
  providerAddressLine1: {
    required: true,
    minLength: 5,
    maxLength: 100
  },
  providerAddressLine2: {
    maxLength: 100
  },
  providerCity: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  providerZipCode: {
    required: true,
    pattern: /^\d{5}(-\d{4})?$/,
    custom: (value) => {
      if (!/^\d{5}(-\d{4})?$/.test(value)) {
        return 'ZIP code must be 5 digits or 5+4 format';
      }
      return null;
    }
  },
  providerContactName: {
    minLength: 2,
    maxLength: 100
  },
  providerPhoneNumber: {
    pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    custom: (value) => {
      if (value && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)) {
        return 'Phone number must be in format (555) 123-4567';
      }
      return null;
    }
  },

  // Subscriber/Patient Information
  subscriberFirstName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  subscriberLastName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  subscriberMemberId: {
    required: true,
    minLength: 1,
    maxLength: 50
  },
  subscriberDateOfBirth: {
    required: true,
    custom: (value) => {
      if (!value) return 'Date of birth is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Invalid date format';
      if (date > new Date()) return 'Date of birth cannot be in the future';
      return null;
    }
  },
  subscriberAddressLine1: {
    required: true,
    minLength: 5,
    maxLength: 100
  },
  subscriberAddressLine2: {
    maxLength: 100
  },
  subscriberCity: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  subscriberZipCode: {
    required: true,
    pattern: /^\d{5}(-\d{4})?$/,
    custom: (value) => {
      if (!/^\d{5}(-\d{4})?$/.test(value)) {
        return 'ZIP code must be 5 digits or 5+4 format';
      }
      return null;
    }
  },

  // Payer Information
  payerName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  payerId: {
    required: true,
    minLength: 1,
    maxLength: 50
  },

  // Claim Information
  claimId: {
    required: true,
    minLength: 1,
    maxLength: 50
  },
  totalChargeAmount: {
    required: true,
    min: 0.01,
    custom: (value) => {
      if (!value) return 'Total charge amount is required';
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
      if (num > 999999.99) return 'Amount cannot exceed $999,999.99';
      return null;
    }
  },

  // Diagnosis Information
  primaryDiagnosisCode: {
    required: true,
    pattern: /^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/,
    custom: (value) => {
      if (!/^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/.test(value)) {
        return 'Diagnosis code must be in ICD-10 format (e.g., E11.9)';
      }
      return null;
    }
  },
  additionalDiagnosisCode1: {
    pattern: /^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/,
    custom: (value) => {
      if (value && !/^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/.test(value)) {
        return 'Diagnosis code must be in ICD-10 format (e.g., I10)';
      }
      return null;
    }
  },
  additionalDiagnosisCode2: {
    pattern: /^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/,
    custom: (value) => {
      if (value && !/^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/.test(value)) {
        return 'Diagnosis code must be in ICD-10 format (e.g., Z51.11)';
      }
      return null;
    }
  },
  additionalDiagnosisCode3: {
    pattern: /^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/,
    custom: (value) => {
      if (value && !/^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/.test(value)) {
        return 'Diagnosis code must be in ICD-10 format (e.g., Z79.4)';
      }
      return null;
    }
  },
  additionalDiagnosisCode4: {
    pattern: /^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/,
    custom: (value) => {
      if (value && !/^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/.test(value)) {
        return 'Diagnosis code must be in ICD-10 format (e.g., Z51.81)';
      }
      return null;
    }
  },

  // Rendering Provider Info
  renderingProviderName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  renderingProviderNpi: {
    required: true,
    pattern: /^\d{10}$/,
    custom: (value) => {
      if (!/^\d{10}$/.test(value)) {
        return 'NPI must be exactly 10 digits';
      }
      return null;
    }
  },
  referringProviderName: {
    minLength: 2,
    maxLength: 100
  },
  referringProviderNpi: {
    pattern: /^\d{10}$/,
    custom: (value) => {
      if (value && !/^\d{10}$/.test(value)) {
        return 'NPI must be exactly 10 digits';
      }
      return null;
    }
  },

  // Insurance Information
  groupNumber: {
    minLength: 1,
    maxLength: 50
  },
  policyNumber: {
    minLength: 1,
    maxLength: 50
  },
  priorAuthorizationNumber: {
    minLength: 1,
    maxLength: 50
  },

  // Service Lines
  serviceLine1ProcedureCode: {
    required: true,
    pattern: /^[A-Z0-9]{5}$/,
    custom: (value) => {
      if (!/^[A-Z0-9]{5}$/.test(value)) {
        return 'Procedure code must be 5 characters (CPT/HCPCS)';
      }
      return null;
    }
  },
  serviceLine1Modifier1: {
    pattern: /^[A-Z0-9]{2}$/,
    custom: (value) => {
      if (value && !/^[A-Z0-9]{2}$/.test(value)) {
        return 'Modifier must be 2 characters';
      }
      return null;
    }
  },
  serviceLine1Modifier2: {
    pattern: /^[A-Z0-9]{2}$/,
    custom: (value) => {
      if (value && !/^[A-Z0-9]{2}$/.test(value)) {
        return 'Modifier must be 2 characters';
      }
      return null;
    }
  },
  serviceLine1ChargeAmount: {
    required: true,
    min: 0.01,
    custom: (value) => {
      if (!value) return 'Charge amount is required';
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
      if (num > 999999.99) return 'Amount cannot exceed $999,999.99';
      return null;
    }
  },
  serviceLine1Quantity: {
    required: true,
    min: 1,
    custom: (value) => {
      if (!value) return 'Quantity is required';
      const num = parseInt(value);
      if (isNaN(num) || num < 1) return 'Quantity must be at least 1';
      if (num > 999) return 'Quantity cannot exceed 999';
      return null;
    }
  },
  serviceLine1RenderingProviderNpi: {
    pattern: /^\d{10}$/,
    custom: (value) => {
      if (value && !/^\d{10}$/.test(value)) {
        return 'NPI must be exactly 10 digits';
      }
      return null;
    }
  },

  serviceLine2ProcedureCode: {
    pattern: /^[A-Z0-9]{5}$/,
    custom: (value) => {
      if (value && !/^[A-Z0-9]{5}$/.test(value)) {
        return 'Procedure code must be 5 characters (CPT/HCPCS)';
      }
      return null;
    }
  },
  serviceLine2Modifier1: {
    pattern: /^[A-Z0-9]{2}$/,
    custom: (value) => {
      if (value && !/^[A-Z0-9]{2}$/.test(value)) {
        return 'Modifier must be 2 characters';
      }
      return null;
    }
  },
  serviceLine2Modifier2: {
    pattern: /^[A-Z0-9]{2}$/,
    custom: (value) => {
      if (value && !/^[A-Z0-9]{2}$/.test(value)) {
        return 'Modifier must be 2 characters';
      }
      return null;
    }
  },
  serviceLine2ChargeAmount: {
    min: 0.01,
    custom: (value) => {
      if (value) {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
        if (num > 999999.99) return 'Amount cannot exceed $999,999.99';
      }
      return null;
    }
  },
  serviceLine2Quantity: {
    min: 1,
    custom: (value) => {
      if (value) {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return 'Quantity must be at least 1';
        if (num > 999) return 'Quantity cannot exceed 999';
      }
      return null;
    }
  },
  serviceLine2RenderingProviderNpi: {
    pattern: /^\d{10}$/,
    custom: (value) => {
      if (value && !/^\d{10}$/.test(value)) {
        return 'NPI must be exactly 10 digits';
      }
      return null;
    }
  },

  // Claim Attachments
  attachmentControlNumber: {
    minLength: 1,
    maxLength: 50
  },
  attachmentDescription: {
    maxLength: 200
  },

  // Other Insurance Info
  otherPayerName: {
    minLength: 2,
    maxLength: 100
  },
  otherPayerId: {
    minLength: 1,
    maxLength: 50
  },
  otherInsurancePaidAmount: {
    min: 0,
    custom: (value) => {
      if (value) {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return 'Amount cannot be negative';
        if (num > 999999.99) return 'Amount cannot exceed $999,999.99';
      }
      return null;
    }
  },

  // Notes
  claimNotes: {
    maxLength: 1000
  },

  // Declaration & Authorization
  dateSigned: {
    required: true,
    custom: (value) => {
      if (!value) return 'Date signed is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Invalid date format';
      if (date > new Date()) return 'Date cannot be in the future';
      return null;
    }
  }
};

export const validateField = (name: string, value: string | boolean | string[]): ValidationResult => {
  const rule = validationRules[name];
  if (!rule) {
    return { isValid: true, message: null };
  }

  // Handle different field types
  const stringValue = typeof value === 'string' ? value : '';
  const boolValue = typeof value === 'boolean' ? value : false;
  const arrayValue = Array.isArray(value) ? value : [];

  // Required validation
  if (rule.required) {
    if (typeof value === 'string' && !stringValue.trim()) {
      return { isValid: false, message: 'This field is required. Please enter a value.' };
    }
    if (typeof value === 'boolean' && !boolValue) {
      return { isValid: false, message: 'This field is required. Please check the box to confirm.' };
    }
    if (Array.isArray(value) && arrayValue.length === 0) {
      return { isValid: false, message: 'This field is required. Please select at least one option.' };
    }
  }

  // Skip other validations if field is empty and not required
  if (!rule.required && !stringValue.trim()) {
    return { isValid: true, message: null };
  }

  // Pattern validation with detailed explanations
  if (rule.pattern && stringValue && !rule.pattern.test(stringValue)) {
    switch (name) {
      case 'stControlNumber':
        return { isValid: false, message: 'ST Control Number is required. Please enter a value (e.g., 0003).' };
      case 'providerNpi':
      case 'renderingProviderNpi':
      case 'referringProviderNpi':
      case 'serviceLine1RenderingProviderNpi':
      case 'serviceLine2RenderingProviderNpi':
        return { isValid: false, message: 'NPI must be exactly 10 digits (e.g., 1234567890)' };
      case 'providerEin':
        return { isValid: false, message: 'EIN must be exactly 9 digits (e.g., 123456789)' };
      case 'providerZipCode':
      case 'subscriberZipCode':
        return { isValid: false, message: 'ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)' };
      case 'submitterPhoneNumber':
      case 'providerPhoneNumber':
        return { isValid: false, message: 'Phone number must be in format (555) 123-4567' };
      case 'bhtTime':
        return { isValid: false, message: 'Time must be in HH:MM format (e.g., 14:30)' };
      case 'primaryDiagnosisCode':
      case 'additionalDiagnosisCode1':
      case 'additionalDiagnosisCode2':
      case 'additionalDiagnosisCode3':
      case 'additionalDiagnosisCode4':
        return { isValid: false, message: 'Diagnosis code must be in ICD-10 format (e.g., E11.9, I10, Z51.11)' };
      case 'serviceLine1ProcedureCode':
      case 'serviceLine2ProcedureCode':
        return { isValid: false, message: 'Procedure code must be exactly 5 characters (e.g., 99213, G0008)' };
      case 'serviceLine1Modifier1':
      case 'serviceLine1Modifier2':
      case 'serviceLine2Modifier1':
      case 'serviceLine2Modifier2':
        return { isValid: false, message: 'Modifier must be exactly 2 characters (e.g., 25, 59, 76)' };
      default:
        return { isValid: false, message: 'Invalid format. Please check the required format.' };
    }
  }

  // Length validation with specific guidance
  if (rule.minLength && stringValue.length < rule.minLength) {
    return { isValid: false, message: `Minimum ${rule.minLength} characters required. Current: ${stringValue.length} characters.` };
  }
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return { isValid: false, message: `Maximum ${rule.maxLength} characters allowed. Current: ${stringValue.length} characters.` };
  }

  // Numeric validation with business context
  if (rule.min !== undefined && stringValue) {
    const num = parseFloat(stringValue);
    if (isNaN(num)) {
      return { isValid: false, message: 'Please enter a valid number.' };
    }
    if (num < rule.min) {
      if (name.includes('ChargeAmount') || name.includes('totalChargeAmount')) {
        return { isValid: false, message: `Amount must be at least $${rule.min.toFixed(2)}. Please enter a valid charge amount.` };
      }
      if (name.includes('Quantity')) {
        return { isValid: false, message: `Quantity must be at least ${rule.min}. Please enter a valid quantity.` };
      }
      return { isValid: false, message: `Value must be at least ${rule.min}.` };
    }
  }
  if (rule.max !== undefined && stringValue) {
    const num = parseFloat(stringValue);
    if (isNaN(num)) {
      return { isValid: false, message: 'Please enter a valid number.' };
    }
    if (num > rule.max) {
      if (name.includes('ChargeAmount') || name.includes('totalChargeAmount')) {
        return { isValid: false, message: `Amount cannot exceed $${rule.max.toFixed(2)}. Please enter a valid charge amount.` };
      }
      if (name.includes('Quantity')) {
        return { isValid: false, message: `Quantity cannot exceed ${rule.max}. Please enter a valid quantity.` };
      }
      return { isValid: false, message: `Value cannot exceed ${rule.max}.` };
    }
  }

  // Custom validation with enhanced messages
  if (rule.custom) {
    const customError = rule.custom(stringValue);
    if (customError) {
      return { isValid: false, message: customError };
    }
  }

  return { isValid: true, message: null };
};

export const validateForm = (formData: FormData): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  Object.keys(formData).forEach(fieldName => {
    results[fieldName] = validateField(fieldName, formData[fieldName as keyof FormData]);
  });

  return results;
};

// Enhanced custom validation functions with better explanations
export const enhancedValidationRules: Record<string, ValidationRule> = {
  ...validationRules,

  // Enhanced custom validations
  stControlNumber: {
    ...validationRules.stControlNumber,
    custom: (value) => {
      if (!value.trim()) {
        return 'ST Control Number is required. Please enter a value (e.g., 0003).';
      }
      return null;
    }
  },

  providerNpi: {
    ...validationRules.providerNpi,
    custom: (value) => {
      if (!/^\d{10}$/.test(value)) {
        return 'NPI (National Provider Identifier) must be exactly 10 digits. This is your unique provider identification number.';
      }
      return null;
    }
  },

  providerEin: {
    ...validationRules.providerEin,
    custom: (value) => {
      if (!/^\d{9}$/.test(value)) {
        return 'EIN (Employer Identification Number) must be exactly 9 digits. This is your tax identification number.';
      }
      return null;
    }
  },

  primaryDiagnosisCode: {
    ...validationRules.primaryDiagnosisCode,
    custom: (value) => {
      if (!/^[A-Z]\d{2}\.\d{1,2}[A-Z0-9]?$/.test(value)) {
        return 'Primary diagnosis code must be in ICD-10 format (e.g., E11.9 for diabetes). This is the main reason for the visit.';
      }
      return null;
    }
  },

  serviceLine1ProcedureCode: {
    ...validationRules.serviceLine1ProcedureCode,
    custom: (value) => {
      if (!/^[A-Z0-9]{5}$/.test(value)) {
        return 'Procedure code must be exactly 5 characters (e.g., 99213 for office visit, G0008 for flu shot). This identifies the service provided.';
      }
      return null;
    }
  },

  totalChargeAmount: {
    ...validationRules.totalChargeAmount,
    custom: (value) => {
      if (!value) return 'Total charge amount is required. This is the total amount billed for all services.';
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Amount must be greater than $0.00. Please enter a valid charge amount.';
      if (num > 999999.99) return 'Amount cannot exceed $999,999.99. Please verify the charge amount.';
      return null;
    }
  },

  subscriberDateOfBirth: {
    ...validationRules.subscriberDateOfBirth,
    custom: (value) => {
      if (!value) return 'Date of birth is required for the subscriber.';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Please enter a valid date of birth.';
      if (date > new Date()) return 'Date of birth cannot be in the future. Please enter a valid date.';
      const age = new Date().getFullYear() - date.getFullYear();
      if (age > 120) return 'Please verify the date of birth. The age seems unusually high.';
      return null;
    }
  },

  serviceDateFrom: {
    ...validationRules.serviceDateFrom,
    custom: (value) => {
      if (!value) return 'Service start date is required. This is when the service began.';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Please enter a valid service start date.';
      if (date > new Date()) return 'Service date cannot be in the future. Please enter a valid date.';
      return null;
    }
  },

  serviceDateTo: {
    ...validationRules.serviceDateTo,
    custom: (value) => {
      if (!value) return 'Service end date is required. This is when the service ended.';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Please enter a valid service end date.';
      if (date > new Date()) return 'Service date cannot be in the future. Please enter a valid date.';
      return null;
    }
  }
};
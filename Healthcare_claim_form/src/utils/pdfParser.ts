interface ParsedData {
    [key: string]: string | boolean | string[];
}

export const parsePDF = async (file: File): Promise<ParsedData> => {
    try {
        console.log('Starting PDF parsing...');
        console.log('File name:', file.name);
        console.log('File size:', file.size, 'bytes');

        // For now, let's use a simple approach that works reliably
        // We'll extract text using a basic method and then parse it
        const text = await extractTextFromPDF(file);
        console.log('Extracted text:', text);

        // Parse the extracted text
        const parsedData = parseExtractedText(text);
        console.log('Parsed data:', parsedData);
        return parsedData;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw error;
    }
};

async function extractTextFromPDF(file: File): Promise<string> {
    // Simple approach - read file as text and clean it
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert to string and extract readable text
    let text = '';
    for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        // Only include printable ASCII characters
        if (byte >= 32 && byte <= 126) {
            text += String.fromCharCode(byte);
        } else if (byte === 10 || byte === 13) {
            // Include newlines
            text += '\n';
        }
    }

    // Clean up the text
    text = text.replace(/\x00/g, ''); // Remove null bytes
    text = text.replace(/\r\n/g, '\n'); // Normalize line endings
    text = text.replace(/\r/g, '\n'); // Normalize line endings

    return text;
}

function parseExtractedText(text: string): ParsedData {
    const parsedData: ParsedData = {};

    // Enhanced regex extraction that handles various text formats
    const extractValue = (label: string, isBoolean = false): string | boolean => {
        // Try multiple regex patterns to handle different text layouts
        // The format in the PDF is "Field Name * : Value" or "Field Name : Value"
        const patterns = [
            new RegExp(`${label}\\s*[^:]*\\s*:\\s*([^\\n]+)`, 'i'),
            new RegExp(`${label}\\s*\\*?\\s*:\\s*([^\\n]+)`, 'i'),
            new RegExp(`${label}\\s*[:=]\\s*([^\\n]+)`, 'i'),
            new RegExp(`${label}\\s+([^\\n]+)`, 'i'),
            new RegExp(`(${label})\\s*([^\\n]+)`, 'i')
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let value = match[1] || match[2];
                if (value) {
                    value = value.trim();

                    // Clean common PDF artifacts
                    value = value.replace(/\s*\)\s*Tj\s*$/, ''); // Remove ") Tj" at end
                    value = value.replace(/\s*\)\s*$/, ''); // Remove ")" at end
                    value = value.replace(/^\s*\(\s*/, ''); // Remove "(" at start
                    value = value.replace(/\s*\)\s*$/, ''); // Remove ")" at end again
                    value = value.trim();

                    if (isBoolean) {
                        return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value.toLowerCase() === 'y';
                    }
                    return value;
                }
            }
        }
        return isBoolean ? false : '';
    };

    // Debug: Log the extracted text to see what we're working with
    console.log('Extracted text for parsing:', text.substring(0, 500) + '...');

    // Extract all fields with exact field names from the PDF
    parsedData.stControlNumber = extractValue('ST Control Number');
    parsedData.bhtTransactionId = extractValue('BHT Transaction ID');
    parsedData.bhtDate = extractValue('BHT Date');
    parsedData.bhtTime = extractValue('BHT Time');
    parsedData.submitterName = extractValue('Submitter Name');
    parsedData.submitterId = extractValue('Submitter ID');
    parsedData.submitterContactName = extractValue('Submitter Contact Name');
    parsedData.submitterPhoneNumber = extractValue('Submitter Phone Number');
    parsedData.receiverName = extractValue('Receiver Name');
    parsedData.receiverId = extractValue('Receiver ID');
    parsedData.providerName = extractValue('Provider Name');
    parsedData.providerNpi = extractValue('Provider NPI');
    parsedData.providerEin = extractValue('Provider EIN');
    parsedData.providerAddressLine1 = extractValue('Provider Address Line 1');
    parsedData.providerAddressLine2 = extractValue('Provider Address Line 2');
    parsedData.providerCity = extractValue('Provider City');
    parsedData.providerState = extractValue('Provider State');
    parsedData.providerZipCode = extractValue('Provider ZIP Code');
    parsedData.providerContactName = extractValue('Provider Contact Name');
    parsedData.providerPhoneNumber = extractValue('Provider Phone Number');
    parsedData.subscriberFirstName = extractValue('Subscriber First Name');
    parsedData.subscriberLastName = extractValue('Subscriber Last Name');
    parsedData.subscriberMemberId = extractValue('Subscriber Member ID');
    parsedData.subscriberDateOfBirth = extractValue('Subscriber Date of Birth');
    parsedData.subscriberGender = extractValue('Subscriber Gender');
    parsedData.subscriberAddressLine1 = extractValue('Subscriber Address Line 1');
    parsedData.subscriberAddressLine2 = extractValue('Subscriber Address Line 2');
    parsedData.subscriberCity = extractValue('Subscriber City');
    parsedData.subscriberState = extractValue('Subscriber State');
    parsedData.subscriberZipCode = extractValue('Subscriber ZIP Code');
    parsedData.patientRelationshipToSubscriber = extractValue('Patient Relationship to Subscriber');
    parsedData.payerName = extractValue('Payer Name');
    parsedData.payerId = extractValue('Payer ID');
    parsedData.payerTypeCode = extractValue('Payer Type Code');
    parsedData.claimId = extractValue('Claim ID');
    parsedData.totalChargeAmount = extractValue('Total Charge Amount');
    parsedData.placeOfServiceCode = extractValue('Place of Service Code');
    parsedData.claimFilingIndicatorCode = extractValue('Claim Filing Indicator Code');
    parsedData.acceptAssignment = extractValue('Accept Assignment\\?', true);
    parsedData.benefitsAssignedToProvider = extractValue('Benefits Assigned to Provider\\?', true);
    parsedData.releaseOfInformation = extractValue('Release of Information\\?');
    parsedData.serviceDateFrom = extractValue('Service Date From');
    parsedData.serviceDateTo = extractValue('Service Date To');
    parsedData.emergencyIndicator = extractValue('Emergency Indicator', true);
    parsedData.diagnosisType = extractValue('Diagnosis Type');
    parsedData.primaryDiagnosisCode = extractValue('Primary Diagnosis Code');
    parsedData.additionalDiagnosisCode1 = extractValue('Additional Diagnosis Code 1');
    parsedData.additionalDiagnosisCode2 = extractValue('Additional Diagnosis Code 2');
    parsedData.additionalDiagnosisCode3 = extractValue('Additional Diagnosis Code 3');
    parsedData.additionalDiagnosisCode4 = extractValue('Additional Diagnosis Code 4');
    parsedData.renderingProviderName = extractValue('Rendering Provider Name');
    parsedData.renderingProviderNpi = extractValue('Rendering Provider NPI');
    parsedData.referringProviderName = extractValue('Referring Provider Name');
    parsedData.referringProviderNpi = extractValue('Referring Provider NPI');
    parsedData.insuranceType = extractValue('Insurance Type');
    parsedData.groupNumber = extractValue('Group Number');
    parsedData.policyNumber = extractValue('Policy Number');
    parsedData.priorAuthorizationNumber = extractValue('Prior Authorization Number');
    parsedData.coverageStartDate = extractValue('Coverage Start Date');
    parsedData.coverageEndDate = extractValue('Coverage End Date');

    // Debug: Log some key extracted values
    console.log('Debug - Extracted values:');
    console.log('ST Control Number:', parsedData.stControlNumber);
    console.log('Submitter Name:', parsedData.submitterName);
    console.log('Provider Name:', parsedData.providerName);
    console.log('Claim ID:', parsedData.claimId);

    // Service Line 1
    parsedData.serviceLine1ProcedureCode = extractValue('Service Line 1: Procedure Code');
    parsedData.serviceLine1Modifier1 = extractValue('Service Line 1: Modifier 1');
    parsedData.serviceLine1Modifier2 = extractValue('Service Line 1: Modifier 2');
    parsedData.serviceLine1DiagnosisPointer = [extractValue('Service Line 1: Diagnosis Pointer\\(s\\)')];
    parsedData.serviceLine1ChargeAmount = extractValue('Service Line 1: Charge Amount');
    parsedData.serviceLine1Quantity = extractValue('Service Line 1: Quantity');
    parsedData.serviceLine1UnitOfMeasure = extractValue('Service Line 1: Unit of Measure');
    parsedData.serviceLine1ServiceDate = extractValue('Service Line 1: Service Date');
    parsedData.serviceLine1PlaceOfService = extractValue('Service Line 1: Place of Service');
    parsedData.serviceLine1EmergencyService = extractValue('Service Line 1: Emergency Service\\?', true);
    parsedData.serviceLine1RenderingProviderNpi = extractValue('Service Line 1: Rendering Provider NPI');

    // Service Line 2
    parsedData.serviceLine2ProcedureCode = extractValue('Service Line 2: Procedure Code');
    parsedData.serviceLine2Modifier1 = extractValue('Service Line 2: Modifier 1');
    parsedData.serviceLine2Modifier2 = extractValue('Service Line 2: Modifier 2');
    parsedData.serviceLine2DiagnosisPointer = [extractValue('Service Line 2: Diagnosis Pointer\\(s\\)')];

    // Debug: Log the problematic fields
    console.log('Debug - Problematic fields:');
    console.log('Service Line 1: Procedure Code:', parsedData.serviceLine1ProcedureCode);
    console.log('Service Line 2: Procedure Code:', parsedData.serviceLine2ProcedureCode);
    console.log('Accept Assignment:', parsedData.acceptAssignment);
    console.log('Benefits Assigned to Provider:', parsedData.benefitsAssignedToProvider);
    console.log('Release of Information:', parsedData.releaseOfInformation);
    parsedData.serviceLine2ChargeAmount = extractValue('Service Line 2: Charge Amount');
    parsedData.serviceLine2Quantity = extractValue('Service Line 2: Quantity');
    parsedData.serviceLine2UnitOfMeasure = extractValue('Service Line 2: Unit of Measure');
    parsedData.serviceLine2ServiceDate = extractValue('Service Line 2: Service Date');
    parsedData.serviceLine2PlaceOfService = extractValue('Service Line 2: Place of Service');
    parsedData.serviceLine2EmergencyService = extractValue('Service Line 2: Emergency Service\\?', true);
    parsedData.serviceLine2RenderingProviderNpi = extractValue('Service Line 2: Rendering Provider NPI');

    // Attachments and Other Info
    parsedData.attachmentControlNumber = extractValue('Attachment Control Number');
    parsedData.attachmentTypeCode = extractValue('Attachment Type Code');
    parsedData.attachmentTransmissionMethod = extractValue('Attachment Transmission Method');
    parsedData.attachmentDescription = extractValue('Attachment Description');
    parsedData.otherPayerName = extractValue('Other Payer Name');
    parsedData.otherPayerId = extractValue('Other Payer ID');
    parsedData.otherPayerResponsibilityCode = extractValue('Other Payer Responsibility Code');
    parsedData.otherInsurancePaidAmount = extractValue('Other Insurance Paid Amount');
    parsedData.otherInsuranceCoverageActive = extractValue('Other Insurance Coverage Active\\?', true);
    parsedData.claimNoteCode = extractValue('Claim Note Code');
    parsedData.claimNotes = extractValue('Claim Notes');
    parsedData.patientSignatureOnFile = extractValue('Patient Signature on File', true);
    parsedData.providerSignatureOnFile = extractValue('Provider Signature on File', true);
    parsedData.dateSigned = extractValue('Date Signed');
    parsedData.confirmAccurate = extractValue('I confirm the above information is accurate', true);

    return parsedData;
}
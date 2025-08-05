// Simple test for the PDF parser logic
const testContent = `Billing Information
ST Control Number * : 0003
BHT Transaction ID * : 837PROVNPI01
BHT Date * : 2025-08-04
BHT Time : 10:15
Submitter Information
Submitter Name * : SENDING CLINIC
Submitter ID * : 1234567890
Submitter Contact Name : DR
Submitter Phone Number : 5551234567
Receiver Information
Receiver Name * : INSURANCE CO
Receiver ID * : 9876543210
Billing Provider
Provider Name * : ABC CLINIC
Provider NPI * : 1234567893
Provider EIN * : 123456789
Provider Address Line 1 * : 100 HEALTH ST
Provider Address Line 2 : ANYTOWN, CA 90210
Provider City * : ANYTOWN
Provider State * : CA
Provider ZIP Code * : 90210
Provider Contact Name : PROVIDER CONTACT
Provider Phone Number : 5559876543
Subscriber / Patient Information
Subscriber First Name * : JANE
Subscriber Last Name * : DOE
Subscriber Member ID * : W197890911
Subscriber Date of Birth * : 1980-01-01
Subscriber Gender * : Male
Subscriber Address Line 1 * : 100 HEALTH ST
Subscriber Address Line 2 : ANYTOWN, CA 90210
Subscriber City * : ANYTOWN
Subscriber State * : CA
Subscriber ZIP Code * : 90210
Patient Relationship to Subscriber * : Grandchild
Payer Information
Payer Name * : INSURANCE CO
Payer ID * : 5432109876
Payer Type Code * : CI
Claim Information
Claim ID * : CLM1003
Total Charge Amount * : 600.00
Place of Service Code * : 11
Claim Filing Indicator Code * : MA
Accept Assignment? * : Yes
Benefits Assigned to Provider? * : Yes
Release of Information? * : Y
Service Date From * : 2025-08-04
Service Date To : 2025-08-04
Emergency Indicator : No
Diagnosis Information
Diagnosis Type * : ICD-10-CM
Primary Diagnosis Code * : J30.9
Additional Diagnosis Code 1 : 
Additional Diagnosis Code 2 : 
Additional Diagnosis Code 3 : 
Additional Diagnosis Code 4 : 
Rendering Provider Info
Rendering Provider Name * : SMITH DR
Rendering Provider NPI * : 3332211111
Referring Provider Name : DR
Referring Provider NPI : 4443322222
Insurance Information
Insurance Type * : 13
Group Number : 123456789
Policy Number : POL123456789
Prior Authorization Number : PA123456789
Coverage Start Date : 2025-01-01
Coverage End Date : 2025-12-31
Service Lines
Service Line 1: Procedure Code (CPT/HCPCS) * : 99213
Service Line 1: Modifier 1 : 
Service Line 1: Modifier 2 : 
Service Line 1: Diagnosis Pointer(s) * : 1
Service Line 1: Charge Amount * : 300.00
Service Line 1: Quantity * : 1
Service Line 1: Unit of Measure : UN
Service Line 1: Service Date * : 2025-08-04
Service Line 1: Place of Service : 11
Service Line 1: Emergency Service? : No
Service Line 1: Rendering Provider NPI : 3332211111
Service Line 2: Procedure Code (CPT/HCPCS) * : 99213
Service Line 2: Modifier 1 : 
Service Line 2: Modifier 2 : 
Service Line 2: Diagnosis Pointer(s) * : 1
Service Line 2: Charge Amount * : 300.00
Service Line 2: Quantity * : 1
Service Line 2: Unit of Measure : UN
Service Line 2: Service Date * : 2025-08-04
Service Line 2: Place of Service : 11
Service Line 2: Emergency Service? : No
Service Line 2: Rendering Provider NPI : 3332212222
Claim Attachments
Attachment Control Number : ATT123456789
Attachment Type Code : OZ
Attachment Transmission Method : EL
Attachment Description : Supporting documentation
Other Insurance Info
Other Payer Name : SECONDARY INSURANCE
Other Payer ID : 9876543210
Other Payer Responsibility Code : S
Other Insurance Paid Amount : 150.00
Other Insurance Coverage Active? : Yes
Notes
Claim Note Code : ADD
Claim Notes : Services provided by different rendering providers to bypass CO-59.
Declaration & Authorization
Patient Signature on File * : Yes
Provider Signature on File * : Yes
Date Signed * : 2025-08-04
Acknowledgment
I confirm the above information is accurate * : Yes`;

// Test the regex pattern
const extractValue = (label, isBoolean = false) => {
    const patterns = [
        new RegExp(`${label}\\s*\\*?\\s*:\\s*([^\\n]+)`, 'i'),
        new RegExp(`${label}\\s*[:=]\\s*([^\\n]+)`, 'i'),
        new RegExp(`${label}\\s+([^\\n]+)`, 'i'),
        new RegExp(`(${label})\\s*([^\\n]+)`, 'i')
    ];

    for (const pattern of patterns) {
        const match = testContent.match(pattern);
        if (match) {
            let value = match[1] || match[2];
            if (value) {
                value = value.trim();
                if (isBoolean) {
                    return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
                }
                return value;
            }
        }
    }
    return isBoolean ? false : '';
};

// Test a few key fields
console.log('Testing PDF parser...');
console.log('ST Control Number:', extractValue('ST Control Number'));
console.log('BHT Transaction ID:', extractValue('BHT Transaction ID'));
console.log('Submitter Name:', extractValue('Submitter Name'));
console.log('Provider Name:', extractValue('Provider Name'));
console.log('Subscriber First Name:', extractValue('Subscriber First Name'));
console.log('Claim ID:', extractValue('Claim ID'));
console.log('Accept Assignment:', extractValue('Accept Assignment', true));
console.log('Service Line 1: Procedure Code:', extractValue('Service Line 1: Procedure Code \\(CPT/HCPCS\\)'));
console.log('Service Line 1: Charge Amount:', extractValue('Service Line 1: Charge Amount')); 
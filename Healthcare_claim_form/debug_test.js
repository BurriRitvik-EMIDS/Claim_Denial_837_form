// Debug test for the Service Line Procedure Code fields
const testContent = `Service Line 1: Procedure Code (CPT/HCPCS) * : 99213
Service Line 2: Procedure Code (CPT/HCPCS) * : 99213`;

const extractValue = (label, isBoolean = false) => {
    const patterns = [
        new RegExp(`${label}\\s*[^:]*\\s*:\\s*([^\\n]+)`, 'i'),
        new RegExp(`${label}\\s*\\*?\\s*:\\s*([^\\n]+)`, 'i'),
        new RegExp(`${label}\\s*[:=]\\s*([^\\n]+)`, 'i'),
        new RegExp(`${label}\\s+([^\\n]+)`, 'i'),
        new RegExp(`(${label})\\s*([^\\n]+)`, 'i')
    ];

    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = testContent.match(pattern);
        if (match) {
            let value = match[1] || match[2];
            if (value) {
                value = value.trim();
                console.log(`Pattern ${i} matched for "${label}": "${value}"`);
                return value;
            }
        }
    }
    return '';
};

console.log('Testing Service Line Procedure Code fields:');
console.log('Service Line 1: Procedure Code:', extractValue('Service Line 1: Procedure Code'));
console.log('Service Line 2: Procedure Code:', extractValue('Service Line 2: Procedure Code')); 
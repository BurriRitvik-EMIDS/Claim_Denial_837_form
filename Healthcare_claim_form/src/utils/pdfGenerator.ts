import jsPDF from 'jspdf';

export interface ValidationResult {
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

export interface ExportData {
    validationStatus: string;
    results: ValidationResult[];
    processingTime?: number;
    agentMessages?: any[];
    deniedCount: number;
    approvedCount: number;
}

// Derive a human-readable risk level from either priority/risk_level or probability
const deriveRiskLevel = (result: ValidationResult): 'High' | 'Medium' | 'Low' => {
    const priority = result.priority || result.risk_level;
    if (priority) {
        const p = priority.toLowerCase();
        if (p.includes('high')) return 'High';
        if (p.includes('medium')) return 'Medium';
        if (p.includes('low')) return 'Low';
    }
    const prob = parseInt((result.probability || '0').replace('%', '')) || 0;
    if (prob >= 80) return 'High';
    if (prob >= 50) return 'Medium';
    return 'Low';
};

// Build a comprehensive, multi-section report and return Base64 string
export const generatePDFBase64 = async (
    data: ExportData,
    appName: string = 'Healthcare Claim Form'
): Promise<string> => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;
    const sectionSpacing = 12;

    const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
        }
    };

    const addDivider = () => {
        pdf.setDrawColor(210, 210, 210);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
    };

    const addLabelValue = (label: string, value: string) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(`${label}:`, margin, yPosition);
        const labelWidth = pdf.getTextWidth(`${label}:`);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value || '-', margin + labelWidth + 4, yPosition);
        yPosition += 7;
    };

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('Claim Denial Analysis Report', margin, yPosition);
    yPosition += 10;

    // Sub header
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(90, 90, 90);
    pdf.text(
        `Validation: ${data.validationStatus?.charAt(0).toUpperCase() + data.validationStatus?.slice(1) || '-'}`,
        margin,
        yPosition
    );
    yPosition += 7;
    pdf.text(
        `Analyzed: ${data.results.length} service(s) • At Risk: ${data.deniedCount} • Approved: ${data.approvedCount}`,
        margin,
        yPosition
    );
    yPosition += sectionSpacing;
    pdf.setTextColor(0, 0, 0);
    addDivider();

    // Render each result block per required fields
    data.results.forEach((result, idx) => {
        checkNewPage(60);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(`Entry ${idx + 1}`, margin, yPosition);
        yPosition += 8;

        // Required fields
        const denialStatus = result.denied ? 'Denied' : 'Approved';
        const decision = result.denied ? 'Deny' : 'Approve';
        const riskLevel = deriveRiskLevel(result);
        const probability = result.probability || '-';
        const shortReason = (result.reason || '').trim().slice(0, 160);
        const detailedReason = result.reason || '-';
        const suggestedFix = result.suggested_fix || '-';

        addLabelValue('Claim Code', result.code);
        addLabelValue('Denial Status', denialStatus);
        addLabelValue('Risk Level', riskLevel);
        addLabelValue('Decision', decision);
        addLabelValue('Probability of Denial', probability);

        // Short Reasoning
        pdf.setFont('helvetica', 'bold');
        pdf.text('Short Reasoning:', margin, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');
        const shortLines = pdf.splitTextToSize(shortReason || '-', contentWidth);
        pdf.text(shortLines, margin, yPosition);
        yPosition += shortLines.length * 6;

        // Detailed Reason
        checkNewPage(30);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detailed Reason:', margin, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');
        const detailLines = pdf.splitTextToSize(detailedReason, contentWidth);
        pdf.text(detailLines, margin, yPosition);
        yPosition += detailLines.length * 6;

        // Suggested Fix
        checkNewPage(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Suggested Fix:', margin, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');
        const fixLines = pdf.splitTextToSize(suggestedFix, contentWidth);
        pdf.text(fixLines, margin, yPosition);
        yPosition += fixLines.length * 6 + 4;

        addDivider();
    });

    // Footer on each page
    const totalPages = pdf.getNumberOfPages();
    const footer = `Generated by ${appName} – ${new Date().toLocaleString()}`;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text(footer, margin, pageHeight - 10);
    }

    // Output Base64 only (no data URL prefix)
    const dataUri = pdf.output('datauristring');
    const base64 = dataUri.split(',')[1] || '';
    return base64;
};

// Legacy: generate and immediately download a full report (kept for backward compatibility)
export const generatePDF = async (data: ExportData): Promise<void> => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    let yPosition = margin;
    const sectionSpacing = 15;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.4); // Return height used
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Healthcare Claim Denial Analysis Report', margin, yPosition);
    yPosition += 15;

    // Subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Comprehensive Risk Assessment & Recommendations', margin, yPosition);
    yPosition += 20;

    // Date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    pdf.text(`Generated on: ${currentDate}`, margin, yPosition);
    yPosition += 10;

    // Report ID
    const reportId = `RPT-${new Date().getTime().toString().slice(-6)}`;
    pdf.text(`Report ID: ${reportId}`, margin, yPosition);
    yPosition += sectionSpacing;

    // Executive Summary
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    const summaryText = `Validation Status: ${data.validationStatus.charAt(0).toUpperCase() + data.validationStatus.slice(1)}
Total Services Analyzed: ${data.results.length}
Services at Risk: ${data.deniedCount}
Services Approved: ${data.approvedCount}
Processing Time: ${data.processingTime || 0} seconds`;

    const summaryHeight = addWrappedText(summaryText, margin, yPosition, contentWidth);
    yPosition += summaryHeight + sectionSpacing;

    // Risk Assessment
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Assessment', margin, yPosition);
    yPosition += 10;

    // Calculate overall risk percentage
    const deniedResults = data.results.filter(r => r.denied);
    const overallRisk = deniedResults.length > 0
        ? deniedResults.reduce((sum, r) => {
            const prob = parseInt(r.probability.replace('%', ''));
            return sum + prob;
        }, 0) / deniedResults.length
        : 0;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const riskText = `Overall Denial Risk: ${overallRisk.toFixed(1)}%
High Priority Issues: ${deniedResults.filter(r => {
        const priority = r.priority || r.risk_level;
        return priority && priority.toLowerCase().includes('high');
    }).length}
Medium Priority Issues: ${deniedResults.filter(r => {
        const priority = r.priority || r.risk_level;
        return priority && priority.toLowerCase().includes('medium');
    }).length}`;

    const riskHeight = addWrappedText(riskText, margin, yPosition, contentWidth);
    yPosition += riskHeight + sectionSpacing;

    // Detailed Analysis
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Analysis', margin, yPosition);
    yPosition += 10;

    // Process each result
    for (let i = 0; i < data.results.length; i++) {
        const result = data.results[i];

        checkNewPage(50); // Approximate height needed for each result

        // Result header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Service Code: ${result.code}`, margin, yPosition);
        yPosition += 8;

        // Status and probability
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const status = result.denied ? 'DENIAL RISK DETECTED' : 'APPROVED FOR PROCESSING';
        const statusColor = result.denied ? [255, 0, 0] : [0, 128, 0];
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(`Status: ${status}`, margin, yPosition);
        yPosition += 6;

        pdf.text(`Risk Probability: ${result.probability}`, margin, yPosition);
        yPosition += 6;

        // Reset text color
        pdf.setTextColor(0, 0, 0);

        // Risk analysis
        pdf.setFont('helvetica', 'bold');
        pdf.text('Risk Analysis:', margin, yPosition);
        yPosition += 6;

        pdf.setFont('helvetica', 'normal');
        const reasonHeight = addWrappedText(result.reason, margin, yPosition, contentWidth);
        yPosition += reasonHeight + 6;

        // Recommended action
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recommended Action:', margin, yPosition);
        yPosition += 6;

        pdf.setFont('helvetica', 'normal');
        const fixHeight = addWrappedText(result.suggested_fix, margin, yPosition, contentWidth);
        yPosition += fixHeight + sectionSpacing;

        // Add separator line
        if (i < data.results.length - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
        }
    }

    // Agent Analysis (if available)
    if (data.agentMessages && data.agentMessages.length > 0) {
        checkNewPage(30);

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Agent Analysis', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        for (const message of data.agentMessages) {
            const textContent = message.content?.parts?.[0]?.text;
            const author = message.author;

            if (textContent && author) {
                checkNewPage(30);

                pdf.setFont('helvetica', 'bold');
                pdf.text(`Agent: ${author}`, margin, yPosition);
                yPosition += 6;

                pdf.setFont('helvetica', 'normal');
                const messageHeight = addWrappedText(textContent, margin, yPosition, contentWidth);
                yPosition += messageHeight + 8;
            }
        }
    }

    // Recommendations
    checkNewPage(40);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    const recommendations = [
        'Review all high-priority issues before submission',
        'Implement suggested fixes for denied services',
        'Consider additional documentation for medium-risk items',
        'Monitor claim processing status after submission',
        'Maintain detailed records for future reference'
    ];

    for (const rec of recommendations) {
        checkNewPage(10);
        pdf.text(`• ${rec}`, margin, yPosition);
        yPosition += 6;
    }

    // Summary Statistics
    checkNewPage(30);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary Statistics', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    const stats = [
        `Total Services Analyzed: ${data.results.length}`,
        `Services at Risk: ${data.deniedCount}`,
        `Services Approved: ${data.approvedCount}`,
        `Risk Percentage: ${data.deniedCount > 0 ? ((data.deniedCount / data.results.length) * 100).toFixed(1) : '0'}%`,
        `Processing Time: ${data.processingTime || 0} seconds`
    ];

    for (const stat of stats) {
        checkNewPage(8);
        pdf.text(`• ${stat}`, margin, yPosition);
        yPosition += 6;
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `claim_denial_analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
};

// Return Base64 so callers can decide to download or send over network
export const exportToPDFBase64 = async (
    data: ExportData,
    appName?: string
): Promise<string> => {
    try {
        const base64 = await generatePDFBase64(data, appName);
        return base64;
    } catch (error) {
        console.error('Error generating Base64 PDF:', error);
        throw error;
    }
};

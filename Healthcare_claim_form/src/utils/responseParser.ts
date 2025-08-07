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

export interface ParsedResponse {
  validationStatus: string;
  results: ValidationResult[];
  processingTime: number;
  agentMessages: any[];
}

export function parseAgentResponse(agentResponse: string): ParsedResponse {
  try {
    const responseData = JSON.parse(agentResponse);

    // Extract agent messages
    const agentMessages = Array.isArray(responseData) ? responseData : [];

    // Debug logging
    console.log('Parsing agent response:', {
      messageCount: agentMessages.length,
      firstMessage: agentMessages[0]?.content?.parts?.[0]?.text?.substring(0, 100) + '...'
    });

    // Default values
    let validationStatus = 'valid';
    let results: ValidationResult[] = [];
    let processingTime = 2.3;

    // Try to extract validation results from agent messages
    for (const message of agentMessages) {
      const textContent = message.content?.parts?.[0]?.text;
      if (textContent) {
        // Look for JSON blocks in the message
        const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[1]);

            // Check if this contains validation results
            if (jsonData.validation_results || jsonData.results) {
              const validationResults = jsonData.validation_results || jsonData.results;
              if (Array.isArray(validationResults)) {
                results = validationResults.map((result: any) => ({
                  code: result.code || result.service_code || result.procedure_code || 'Unknown',
                  denied: result.denied || result.risk_detected || result.denial_risk || false,
                  probability: result.probability || result['probability of denial based on given reasons'] || result.risk_percentage || result.risk_probability || '0%',
                  reason: result.reason || result.analysis || result.risk_analysis || 'No analysis provided',
                  suggested_fix: result.suggested_fix || result.recommendation || result.action_recommendation || 'No recommendation provided',
                  service_code: result.service_code || result.procedure_code,
                  risk_detected: result.risk_detected || result.denial_risk,
                  risk_percentage: result.risk_percentage || result.risk_probability,
                  analysis: result.analysis || result.risk_analysis,
                  recommendation: result.recommendation || result.action_recommendation,
                  priority: result.priority || result.risk_priority,
                  risk_level: result.risk_level || result.risk_category
                }));
              }
            }

            // Handle single result object (not in array)
            if (jsonData.code && !Array.isArray(jsonData)) {
              results = [{
                code: jsonData.code || 'Unknown',
                denied: jsonData.denied || false,
                probability: jsonData.probability || jsonData['probability of denial based on given reasons'] || '0%',
                reason: jsonData.reason || 'No analysis provided',
                suggested_fix: jsonData.suggested_fix || 'No recommendation provided',
                service_code: jsonData.service_code,
                risk_detected: jsonData.denied,
                risk_percentage: jsonData['probability of denial based on given reasons'],
                analysis: jsonData.reason,
                recommendation: jsonData.suggested_fix,
                priority: jsonData.denied ? 'High' : 'Low',
                risk_level: jsonData.denied ? 'High' : 'Low'
              }];
            }

            // Check for validation status
            if (jsonData.validation_status) {
              validationStatus = jsonData.validation_status;
            }

            // Check for processing time
            if (jsonData.processing_time) {
              processingTime = jsonData.processing_time;
            }
          } catch (jsonError) {
            console.warn('Failed to parse JSON in agent message:', jsonError);
          }
        }

        // Also try to parse the entire message as JSON
        try {
          const messageData = JSON.parse(textContent);
          if (messageData.validation_results || messageData.results) {
            const validationResults = messageData.validation_results || messageData.results;
            if (Array.isArray(validationResults)) {
              results = validationResults.map((result: any) => ({
                code: result.code || result.service_code || result.procedure_code || 'Unknown',
                denied: result.denied || result.risk_detected || result.denial_risk || false,
                probability: result.probability || result['probability of denial based on given reasons'] || result.risk_percentage || result.risk_probability || '0%',
                reason: result.reason || result.analysis || result.risk_analysis || 'No analysis provided',
                suggested_fix: result.suggested_fix || result.recommendation || result.action_recommendation || 'No recommendation provided',
                service_code: result.service_code || result.procedure_code,
                risk_detected: result.risk_detected || result.denial_risk,
                risk_percentage: result.risk_percentage || result.risk_probability,
                analysis: result.analysis || result.risk_analysis,
                recommendation: result.recommendation || result.action_recommendation,
                priority: result.priority || result.risk_priority,
                risk_level: result.risk_level || result.risk_category
              }));
            }
          }

          // Handle single result object (not in array)
          if (messageData.code && !Array.isArray(messageData)) {
            results = [{
              code: messageData.code || 'Unknown',
              denied: messageData.denied || false,
              probability: messageData.probability || messageData['probability of denial based on given reasons'] || '0%',
              reason: messageData.reason || 'No analysis provided',
              suggested_fix: messageData.suggested_fix || 'No recommendation provided',
              service_code: messageData.service_code,
              risk_detected: messageData.denied,
              risk_percentage: messageData['probability of denial based on given reasons'],
              analysis: messageData.reason,
              recommendation: messageData.suggested_fix,
              priority: messageData.denied ? 'High' : 'Low',
              risk_level: messageData.denied ? 'High' : 'Low'
            }];
          }

          if (messageData.validation_status) {
            validationStatus = messageData.validation_status;
          }

          if (messageData.processing_time) {
            processingTime = messageData.processing_time;
          }
        } catch (messageError) {
          // Not a JSON message, continue
        }
      }
    }

    // If no results found, try to extract from agent messages more aggressively
    if (results.length === 0) {
      results = extractResultsFromMessages(agentMessages);
    }

    // Ensure we always have at least one result with meaningful data
    if (results.length === 0) {
      // Create a fallback result based on the most recent agent message
      const lastMessage = agentMessages[agentMessages.length - 1];
      if (lastMessage && lastMessage.content?.parts?.[0]?.text) {
        const textContent = lastMessage.content.parts[0].text;
        const messageText = textContent.toLowerCase();

        // Extract any available information
        const codeMatches = messageText.match(/(\d{5})/g) || [];
        const cptMatches = messageText.match(/([A-Z]\d{4})/g) || [];
        const coMatches = messageText.match(/(CO\d+)/g) || [];
        const allCodes = [...codeMatches, ...cptMatches, ...coMatches];

        const probabilityMatch = messageText.match(/probability of denial.*?(\d+)%/i) ||
          messageText.match(/(\d+)%.*?denial/i) ||
          messageText.match(/denial.*?(\d+)%/i);
        const probability = probabilityMatch ? `${probabilityMatch[1]}%` : '0%';

        const isDenied = messageText.includes('denied') || messageText.includes('denial') ||
          messageText.includes('co-59') || messageText.includes('error') ||
          messageText.includes('risk') || messageText.includes('bundling');

        results.push({
          code: allCodes.length > 0 ? allCodes[0] : 'Unknown',
          denied: isDenied,
          probability: probability,
          reason: extractReasonFromText(textContent),
          suggested_fix: extractFixFromText(textContent),
          priority: isDenied ? 'High' : 'Low',
          risk_level: isDenied ? 'High' : 'Low'
        });
      }
    }

    return {
      validationStatus,
      results,
      processingTime,
      agentMessages
    };
  } catch (error) {
    console.error('Failed to parse agent response:', error);

    // Return default response
    return {
      validationStatus: 'valid',
      results: extractResultsFromMessages([]),
      processingTime: 2.3,
      agentMessages: []
    };
  }
}

function extractResultsFromMessages(agentMessages: any[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const message of agentMessages) {
    const textContent = message.content?.parts?.[0]?.text;
    if (!textContent) continue;

    // Look for JSON blocks in the message
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);

        // Handle single result object
        if (jsonData.code) {
          const result: ValidationResult = {
            code: jsonData.code,
            denied: jsonData.denied || false,
            probability: jsonData['probability of denial based on given reasons'] || jsonData.probability || '0%',
            reason: jsonData.reason || 'No analysis provided',
            suggested_fix: jsonData.suggested_fix || 'No recommendation provided',
            priority: jsonData.denied ? 'High' : 'Low',
            risk_level: jsonData.denied ? 'High' : 'Low'
          };
          results.push(result);
        }
      } catch (e) {
        console.warn('Failed to parse JSON in message:', e);
      }
    }

    // Also try to parse the entire message as JSON if no code blocks found
    if (results.length === 0) {
      try {
        const messageData = JSON.parse(textContent);
        if (messageData.code) {
          const result: ValidationResult = {
            code: messageData.code,
            denied: messageData.denied || false,
            probability: messageData['probability of denial based on given reasons'] || messageData.probability || '0%',
            reason: messageData.reason || 'No analysis provided',
            suggested_fix: messageData.suggested_fix || 'No recommendation provided',
            priority: messageData.denied ? 'High' : 'Low',
            risk_level: messageData.denied ? 'High' : 'Low'
          };
          results.push(result);
        }
      } catch (e) {
        // Not a JSON message, continue to text extraction
      }
    }

    // Extract from plain text if no JSON found
    if (results.length === 0) {
      const messageText = textContent.toLowerCase();

      // Extract code patterns (more comprehensive)
      const codeMatches = messageText.match(/(\d{5})/g) || [];
      const cptMatches = messageText.match(/([A-Z]\d{4})/g) || [];
      const coMatches = messageText.match(/(CO\d+)/g) || [];
      const allCodes = [...codeMatches, ...cptMatches, ...coMatches];

      // Extract probability with better pattern matching
      const probabilityMatch = messageText.match(/probability of denial.*?(\d+)%/i) ||
        messageText.match(/(\d+)%.*?denial/i) ||
        messageText.match(/denial.*?(\d+)%/i);
      const probability = probabilityMatch ? `${probabilityMatch[1]}%` : '0%';

      // Determine if denied based on content
      const isDenied = messageText.includes('denied') || messageText.includes('denial') ||
        messageText.includes('co-59') || messageText.includes('error') ||
        messageText.includes('risk') || messageText.includes('bundling');

      if (allCodes.length > 0) {
        const result: ValidationResult = {
          code: allCodes[0],
          denied: isDenied,
          probability: probability,
          reason: extractReasonFromText(textContent),
          suggested_fix: extractFixFromText(textContent),
          priority: isDenied ? 'High' : 'Low',
          risk_level: isDenied ? 'High' : 'Low'
        };
        results.push(result);
      }
    }
  }

  // If still no results, try to extract from any message content
  if (results.length === 0) {
    const allMessageText = agentMessages
      .map(msg => msg.content?.parts?.[0]?.text || '')
      .join(' ')
      .toLowerCase();

    // Look for any code patterns in all messages
    const codeMatches = allMessageText.match(/(\d{5})/g) || [];
    const cptMatches = allMessageText.match(/([A-Z]\d{4})/g) || [];
    const coMatches = allMessageText.match(/(CO\d+)/g) || [];
    const allCodes = [...codeMatches, ...cptMatches, ...coMatches];

    // Extract probability from all messages
    const probabilityMatch = allMessageText.match(/probability of denial.*?(\d+)%/i) ||
      allMessageText.match(/(\d+)%.*?denial/i) ||
      allMessageText.match(/denial.*?(\d+)%/i);
    const probability = probabilityMatch ? `${probabilityMatch[1]}%` : '0%';

    const isDenied = allMessageText.includes('denied') || allMessageText.includes('denial') ||
      allMessageText.includes('co-59') || allMessageText.includes('error') ||
      allMessageText.includes('risk') || allMessageText.includes('bundling');

    if (allCodes.length > 0) {
      const allMessagesText = agentMessages
        .map(msg => msg.content?.parts?.[0]?.text || '')
        .join(' ');

      results.push({
        code: allCodes[0],
        denied: isDenied,
        probability: probability,
        reason: extractReasonFromText(allMessagesText),
        suggested_fix: extractFixFromText(allMessagesText),
        priority: isDenied ? 'High' : 'Low',
        risk_level: isDenied ? 'High' : 'Low'
      });
    }
  }

  return results;
}

function extractReasonFromText(text: string): string {
  // Try to extract reason from the text with multiple patterns
  const lines = text.split('\n');

  // Look for reason field in JSON-like format
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('reason:') || lowerLine.includes('analysis:')) {
      const extracted = line.split(':').slice(1).join(':').trim();
      if (extracted && extracted.length > 10) {
        return extracted;
      }
    }
  }

  // Look for reason in JSON blocks
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const jsonData = JSON.parse(jsonMatch[1]);
      if (jsonData.reason && jsonData.reason.length > 10) {
        return jsonData.reason;
      }
    } catch (e) {
      // Continue to other methods
    }
  }

  // Look for sentences that contain analysis keywords
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if ((lowerSentence.includes('cpt') || lowerSentence.includes('code')) &&
      (lowerSentence.includes('billed') || lowerSentence.includes('service') || lowerSentence.includes('denial'))) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20) {
        return trimmed;
      }
    }
  }

  // If no specific reason found, return a meaningful part of the text
  const meaningfulText = text.replace(/```json[\s\S]*?```/g, '').trim();
  if (meaningfulText.length > 50) {
    return meaningfulText.substring(0, 200) + (meaningfulText.length > 200 ? '...' : '');
  }

  return 'Analysis provided by AI agent';
}

function extractFixFromText(text: string): string {
  // Try to extract suggested fix from the text with multiple patterns
  const lines = text.split('\n');

  // Look for suggested_fix field in JSON-like format
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('suggested_fix:') || lowerLine.includes('fix:') || lowerLine.includes('recommendation:')) {
      const extracted = line.split(':').slice(1).join(':').trim();
      if (extracted && extracted.length > 10) {
        return extracted;
      }
    }
  }

  // Look for fix in JSON blocks
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const jsonData = JSON.parse(jsonMatch[1]);
      if (jsonData.suggested_fix && jsonData.suggested_fix.length > 10) {
        return jsonData.suggested_fix;
      }
    } catch (e) {
      // Continue to other methods
    }
  }

  // Look for sentences that contain fix/recommendation keywords
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if ((lowerSentence.includes('review') || lowerSentence.includes('append') || lowerSentence.includes('modifier')) &&
      (lowerSentence.includes('medical') || lowerSentence.includes('record') || lowerSentence.includes('claim'))) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20) {
        return trimmed;
      }
    }
  }

  // If no specific fix found, return a meaningful part of the text
  const meaningfulText = text.replace(/```json[\s\S]*?```/g, '').trim();
  if (meaningfulText.length > 50) {
    const lastPart = meaningfulText.substring(meaningfulText.length - 200);
    return lastPart.length > 50 ? lastPart : meaningfulText.substring(0, 200);
  }

  return 'Review agent recommendations for specific actions';
}

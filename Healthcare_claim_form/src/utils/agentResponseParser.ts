export interface AgentResponse {
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

/**
 * Parses raw agent responses from text format into structured data
 * Handles the format:
 * AgentName
 * ```json
 * { ... }
 * ```
 */
export const parseAgentResponses = (rawText: string): AgentResponse[] => {
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

/**
 * Formats agent responses for display in UI
 */
export const formatAgentResponseForUI = (responses: AgentResponse[]) => {
  const leadValidator = responses.find(r => r.agent_name === 'LeadValidatorAgent');
  const actionRecommender = responses.find(r => r.agent_name === 'ActionRecommenderAgent');
  
  return {
    leadValidator: leadValidator?.response,
    actionRecommender: actionRecommender?.response,
    hasResponses: responses.length > 0
  };
};

/**
 * Example usage with your raw agent response text:
 * 
 * const rawResponse = `
 * LeadValidatorAgent
 * \`\`\`json
 * {
 *   "validation_status": "valid"
 * }
 * \`\`\`
 * 
 * ActionRecommenderAgent
 * \`\`\`json
 * {
 *   "code": "CO59",
 *   "denied": true,
 *   "probability": "95%",
 *   "reason": "Two identical 99213 CPT codes...",
 *   "suggested_fix": "Review the medical documentation..."
 * }
 * \`\`\`
 * `;
 * 
 * const parsed = parseAgentResponses(rawResponse);
 * const formatted = formatAgentResponseForUI(parsed);
 */

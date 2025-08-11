import React from 'react';
import { ResultsPage } from '../components/ResultsPage';
import { parseAgentResponses } from '../utils/agentResponseParser';

// Example of how to use the enhanced ResultsPage with agent responses
export const AgentResponseExample: React.FC = () => {
  // Your raw agent response text (exactly as you provided)
  const rawAgentResponse = `AI Agent Analysis
LeadValidatorAgent
\`\`\`json
{
"validation_status": "valid"
}
\`\`\`

ActionRecommenderAgent
\`\`\`json
{
  'code': 'CO59',
  'denied': true,
  'probability of denial based on given reasons': '95%',
  'reason': 'Two identical 99213 CPT codes are billed on the same date of service (2025-08-05) for the same patient by the same rendering provider (NPI: 1234567893) at the same place of service (11). No modifiers (like 25 or 59) are present to indicate that these were distinct and separately identifiable services. The claim notes explicitly state: "99213 x2 duplicate line items."',
  'suggested_fix': 'Review the medical documentation to determine if the two 99213 services were distinct and separately identifiable. If so, append modifier 25 to the second 99213 if it represents a significant, separately identifiable E/M service. If the services were not distinct, remove the duplicate line item.'
}
\`\`\``;

  // Mock results data (you would get this from your actual claim processing)
  const mockResults = [
    {
      code: 'CO59',
      denied: true,
      probability: '95%',
      reason: 'Two identical 99213 CPT codes are billed on the same date of service',
      suggested_fix: 'Review the medical documentation to determine if the services were distinct',
      service_code: '99213'
    }
  ];

  const handleBack = () => {
    console.log('Going back to previous page');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Agent Response Demo</h1>
      
      {/* This is how you would use the enhanced ResultsPage */}
      <ResultsPage
        validationStatus="valid"
        results={mockResults}
        onBack={handleBack}
        processingTime={2.3}
        rawAgentResponses={rawAgentResponse} // Pass your raw agent response here
      />
    </div>
  );
};

// Example of how to parse responses manually if needed
export const parseResponseExample = () => {
  const rawResponse = `LeadValidatorAgent
\`\`\`json
{
"validation_status": "valid"
}
\`\`\`

ActionRecommenderAgent
\`\`\`json
{
  "code": "CO59",
  "denied": true,
  "probability": "95%",
  "reason": "Duplicate services detected",
  "suggested_fix": "Remove duplicate line item"
}
\`\`\``;

  const parsed = parseAgentResponses(rawResponse);
  console.log('Parsed responses:', parsed);
  
  // Access specific agent responses
  const leadValidator = parsed.find(r => r.agent_name === 'LeadValidatorAgent');
  const actionRecommender = parsed.find(r => r.agent_name === 'ActionRecommenderAgent');
  
  console.log('Lead Validator Status:', leadValidator?.response.validation_status);
  console.log('Action Recommender Code:', actionRecommender?.response.code);
  
  return parsed;
};

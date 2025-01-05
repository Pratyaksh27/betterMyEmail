// src/server/commonPrompts.ts

export const commonPrompts: Record<string, string> = {
    jsonFormatInstruction: `
      Please provide your response in the following JSON format:
  
      \`\`\`json
      {
        "recommended_email": "Your improved email here",
        "rationale": "Explanation of the improvements made"
      }
      \`\`\`
  
      Ensure that the JSON is valid and properly formatted. Do not include any additional text outside of the JSON block.
      Plus there is no need to add the "Subject" line in your response. Just the email content is enough.
      If the recipient or sender name is not present, do NOT add [Name] in the email content for either of them.
    `,
  
    endOfConversation: `
      Consider your answer as the END of the conversation. 
      Do NOT end your response with a follow-up question like 
      'Do you need further assistance?' or 'Is there anything else I can help you with?' 
      as this will confuse the end user. 
      Don't suggest the user to ask further questions.
    `,
  
    onlyOutputJSON: `
      Remember, only output the JSON response in the specified format without any additional text.
    `,
  
    doNotAddSubject: `
      Remember, DON'T give a Subject line. Don't add [Name] if the recipient or sender name is not available.
    `,
  };
  
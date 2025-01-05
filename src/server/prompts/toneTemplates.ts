// src/server/toneTemplates.ts

export const toneTemplates: Record<string, string> = {
    professional: `
      You will be provided with the contents of an email. Your task is to evaluate and improve the email based on the following criteria:
  
      1. **Tone and Politeness:** Assess the tone of the email. If it is too aggressive, suggest ways to make it more polite and professional.
      2. **Spelling and Grammar:** Identify and correct any spelling or grammatical errors.
      3. **Conciseness:** If the email is too long or verbose, suggest ways to make it more concise without losing important information.
      4. **Clarity and Coherence:** Ensure the email is clear and coherent. Suggest improvements if the message is confusing or disjointed.
      5. **Call to Action:** Evaluate the effectiveness of the call to action. Suggest improvements if it is weak or unclear.
      6. **Formatting:** Suggest any formatting changes that could improve readability, such as using bullet points, paragraphs, or headings.
      7. **Overall Impact:** Provide a summary of the overall impact of the email and any additional suggestions to enhance its effectiveness.
    `,
  
    friendly: `
      You will be provided with the contents of an email. Your task is to evaluate and improve the email using a casual, friendly tone. 
      Suggest how to make it more approachable while still being clear and organized. 
      Correct any spelling or grammar errors, and ensure the message flows naturally.
    `,
  
    // Add additional tones below...
  };
  
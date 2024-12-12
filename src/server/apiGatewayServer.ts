import pool from './db';
import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

//require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const api_gateway_server = process.env.API_GATEWAY_SERVER;
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("The OPENAI_API_KEY environment variable is missing or empty.");
  }
  

const openai = new OpenAI({ apiKey });

app.get('/', (req: Request, res: Response) => {
    res.send('API Gateway Server is running');
});

app.get('/test-openai', async (req: Request, res: Response) => {
    try {
        const result = await openai.models.list();
        console.log('API Gateway Server: OpenAI Models: ', result);
        res.json(result);
    } catch (error) {
        console.error('API Gateway Server: Error in OpenAI test: ', error);
    }
});

/*
***  Analyze Email Endpoint: Receives an email content and analyzes it using OpenAI's GPT-4 model.
***  The email content is sent to the GPT-4 model for analysis along with Prompt messages.
***  The response is a JSON object containing the analysis result. 
***  The analysis result is the improved email content along with the rationale for the improvements made.
***  The response is sent back to the client (extension).
*/
app.post('/analyzeEmail', async (req: Request, res: Response) => {
    console.log('API Gateway Server: Analyzing Email Content...');
    const emailContent = req.body.emailContent;
    console.log('API Gateway Server: Email Content found: ', emailContent);
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { 
                    role: "system", 
                    content: `You will be provided with the contents of an email. Your task is to evaluate and improve the email based on the following criteria:

                    1. **Tone and Politeness:** Assess the tone of the email. If it is too aggressive, suggest ways to make it more polite and professional.
                    2. **Spelling and Grammar:** Identify and correct any spelling or grammatical errors.
                    3. **Conciseness:** If the email is too long or verbose, suggest ways to make it more concise without losing important information.
                    4. **Clarity and Coherence:** Ensure the email is clear and coherent. Suggest improvements if the message is confusing or disjointed.
                    5. **Call to Action:** Evaluate the effectiveness of the call to action. Suggest improvements if it is weak or unclear.
                    6. **Formatting:** Suggest any formatting changes that could improve readability, such as using bullet points, paragraphs, or headings.
                    7. **Overall Impact:** Provide a summary of the overall impact of the email and any additional suggestions to enhance its effectiveness.
                    
                    Please provide your response in the following JSON format:
                    
                    \`\`\`json
                    {
                      "recommended_email": "Your improved email here",
                      "rationale": "Explanation of the improvements made"
                    }
                    \`\`\`
                    
                    Ensure that the JSON is valid and properly formatted. Do not include any additional text outside of the JSON block.`
                    
                },
                {
                    role: "system",
                    content: "Consider your answer as the END of the conversation. Do NOT end your response with a follow up question like 'Do you need further assistance?' or 'Is there anything else I can help you with?'  or 'If you have any questions, please feel free to reach out' as this will confuse the end user. Dont suggest the user to ask further questions."
                },
                {
                    role: "user",
                    content: emailContent
                },
                {
                    role: "assistant",
                    content: "Remember, only output the JSON response in the specified format without any additional text."
                }
            ],
            max_tokens: 1000,
            temperature: 0.3,
        });
        const analysisResult = response.choices[0].message.content;
        console.log('API Gateway Server: Email Analysis Result: ', analysisResult);
        return res.json({ analysisResult: analysisResult });
    } catch (error) {
        console.error('API Gateway Server: Error in Email analysis: ', error);
       return res.status(500).send({ message: 'Failed to analyze Email' ,error: error });
    }
});

/*
*** submit_feedback Endpoint: Receives feedback from the user and stores it in the database. 
*/
app.post('/submitFeedback', async (req: Request, res: Response) => {
    console.log('API Gateway Server: Submit Feedback API Endpoint');
    const { uuid, rating, feedback } = req.body;
    console.log('API Gateway Server: Feedback Data: ', { uuid, rating, feedback });
    if (!uuid || !rating || !feedback) {
        return res.status(400).send({ message: 'Missing Required Fields for submitting feedback' });
    }
    try {
        const submit_feedback_query = `
            INSERT INTO user_feedback (uuid, rating, feedback, created_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (uuid) DO UPDATE SET rating = $2, feedback = $3, created_at = NOW()
            RETURNING *;`;
        const client = await pool.connect();
        const result = await client.query(submit_feedback_query, [uuid, rating, feedback]);
        client.release();
        console.log('API Gateway Server: Feedback Submitted Successfully: ', result.rows[0]);
        return res.json(result.rows[0]);
    } catch (error) {
        console.error('API Gateway Server: Error in submitting feedback: ', error);
        return res.status(500).send({ message: 'Failed to submit feedback' });
    }
    
});

type ExpressLayer = {
    route?: { path: string }; // Define only what's needed
    name?: string;
    handle?: Function;
};

app.get('/debug/routes', (req, res) => {
    const routes = app._router.stack
        .filter((layer: ExpressLayer) => layer.route) // Only include routes
        .map((layer: ExpressLayer) => layer.route?.path); // Extract route paths
    res.json(routes);
});


app.listen(port, () => {
    console.log(`API Gateway Server listening at ${api_gateway_server}:${port}`);
});

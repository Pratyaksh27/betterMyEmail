require('dotenv').config();

import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
// import { Configuration, OpenAI } from 'openai';
//import Configuration from 'openai';
//import OpenAIApi from 'openai';
//import OpenAI from 'openai';
import { OpenAI } from 'openai';
// import Configuration from 'openai';
import dotenv from 'dotenv';

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
                    content: "You will be provided with the contents of an email. Your task is to evaluate and improve the email based on the following criteria:" +
                    "\n1. **Tone and Politeness:** Assess the tone of the email. If it is too aggressive, suggest ways to make it more polite and professional." +
                    "\n2. **Spelling and Grammar:** Identify and correct any spelling or grammatical errors." +
                    "\n3. **Conciseness:** If the email is too long or verbose, suggest ways to make it more concise without losing important information." +
                    "\n4. **Clarity and Coherence:** Ensure the email is clear and coherent. Suggest improvements if the message is confusing or disjointed." +
                    "\n5. **Call to Action:** Evaluate the effectiveness of the call to action. Suggest improvements if it is weak or unclear." +
                    "\n6. **Formatting:** Suggest any formatting changes that could improve readability, such as using bullet points, paragraphs, or headings." +
                    "\n7. **Overall Impact:** Provide a summary of the overall impact of the email and any additional suggestions to enhance its effectiveness."
                },
                {
                    role: "system",
                    content: "Consider your answer as the END of the conversation. Do NOT end your response with a follow up question like 'Do you need further assistance?' or 'Is there anything else I can help you with?' as this will confuse the end user."
                },
                {
                    role: "user",
                    content: emailContent
                }
            ],
            max_tokens: 1000
        });
        const analysisResult = response.choices[0].message.content;
        console.log('API Gateway Server: Email Analysis Result: ', analysisResult);
        return res.json({ analysisResult: analysisResult });
    } catch (error) {
        console.error('API Gateway Server: Error in Email analysis: ', error);
       return res.status(500).send({ message: 'Failed to analyze Email' ,error: error });
    }
});

app.listen(port, () => {
    console.log(`API Gateway Server listening at ${api_gateway_server}:${port}`);
});

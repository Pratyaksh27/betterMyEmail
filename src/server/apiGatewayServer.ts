import pool from './db';
import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { toneTemplates } from './prompts/toneTemplates';
import { commonPrompts } from './prompts/commonPrompts';
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

app.post('/createUser', async (req: Request, res: Response) => {
    const { emailID, UUID } = req.body;
    if (!emailID || !UUID) {
        return res.status(400).send({ message: 'Create User API Endpoint: Missing Required Fields for creating user' });
    }
    try {
        const create_user_query = `
            INSERT INTO users (email_id, uuid)
            VALUES ($1, $2)
            ON CONFLICT (uuid) DO UPDATE SET email_id = $1
            RETURNING *;`;
        const client = await pool.connect();
        const result = await client.query(create_user_query, [emailID, UUID]);
        client.release();
        console.log('API Gateway Server: User Created Successfully: ', result.rows[0]);
        return res.json(result.rows[0]);
    } catch (error) {
        console.error('API Gateway Server: Error in creating user: ', error);
        return res.status(500).send({ message: 'Failed to create user' });
    }
});

/*
***  getUUIDFromEmail Endpoint: Receives an email ID and returns the UUID associated with the email ID.
 */
app.post("/getUUIDFromEmail", async (req, res) => {
    const { emailID } = req.body;

    if (!emailID) {
        return res.status(400).json({ error: "getUUIDFromEmail Endpoint: Email ID is required" });
    }

    try {
        const query = "SELECT uuid FROM users WHERE email_id = $1";
        const result = await pool.query(query, [emailID]);

        if (result.rows.length > 0) {
            res.status(200).json({ uuid: result.rows[0].uuid });
        } else {
            res.status(200).json({ uuid: null });
        }
    } catch (error) {
        console.error("getUUIDFromEmail Endpoint: Error retrieving UUID:", error);
        res.status(500).json({ error: "getUUIDFromEmail Endpoint: Internal Server Error" });
    }
});

/*
***  getEmailFromUUID Endpoint: Receives a uuid and returns the Email ID associated with the email ID.
 */
app.post("/getEmailFromUUID", async (req, res) => {
    const { uuid } = req.body;

    if (!uuid) {
        return res.status(400).json({ error: "getEmailFromUUID Endpoint: UUID is required" });
    }

    try {
        const query = "SELECT email_id FROM users WHERE uuid = $1";
        const result = await pool.query(query, [uuid]);

        if (result.rows.length > 0) {
            res.status(200).json({ emailID: result.rows[0].email_id });
        } else {
            res.status(200).json({ emailID: null });
        }
    } catch (error) {
        console.error("getEmailFromUUID Endpoint: Error retrieving Email ID:", error);
        res.status(500).json({ error: "getEmailFromUUID Endpoint: Internal Server Error" });
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
    const selectedTone = req.body.selectedTone || 'professional';
    const toneKey = selectedTone.toLowerCase().toString();
    const toneTemplate = toneTemplates[toneKey] || toneTemplates['professional'];
    console.log('API Gateway Server: Selected Tone: ', selectedTone);
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { 
                    role: "system", 
                    content: commonPrompts.task 
                    
                },
                { 
                    role: "system", 
                    content: toneTemplate
                    
                },
                {
                    role: "system",
                    content: commonPrompts.doNotAddSignature
                },
                {
                    role: "system",
                    content: commonPrompts.jsonFormatInstruction
                },
                {
                    role: "system",
                    content: commonPrompts.endOfConversation
                }, 
                {
                    role: "system",
                    content: commonPrompts.startOfEmailContent
                },
                {
                    role: "user",
                    content: `Beginning of email content\n\n${emailContent}\n\nEnd of email content`
                },
                {
                    role: "system",
                    content: commonPrompts.endOfEmailContent
                },
                {
                    role: "system",
                    content: commonPrompts.doNotAddSignature
                },
                {
                    role: "system",
                    content: commonPrompts.onlyOutputJSON
                },
                {
                    role: "system",
                    content: commonPrompts.doNotAddSubject
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
    // const { uuid, rating, feedback } = req.body;
    // console.log('API Gateway Server: Feedback Data: ', { uuid, rating, feedback });
    const { uuid, type = 'usage', rating = -1, feedback = 'Not Provided', uninstall_reason = 'Not Provided' } = req.body;
    console.log('API Gateway Server: Feedback Data: ', { uuid, type, rating, feedback, uninstall_reason });
    if (!uuid || !type || !feedback) {
        return res.status(400).send({ message: 'Missing Required Fields for submitting feedback' });
    }
    try {
        const submit_feedback_query = `
            INSERT INTO user_feedback (uuid, type, rating, feedback, uninstall_reason, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;`;
        const client = await pool.connect();
        const result = await client.query(submit_feedback_query, [uuid, type, rating, feedback, uninstall_reason]);
        client.release();
        console.log('API Gateway Server: Feedback Submitted Successfully: ', result.rows[0]);
        return res.json(result.rows[0]);
    } catch (error) {
        console.error('API Gateway Server: Error in submitting feedback: ', error);
        return res.status(500).send({ message: 'Failed to submit feedback' });
    }
    
});

app.post('/submitUsageStats', async (req: Request, res: Response) => {
    const { uuid, total_uses, uses_since_last_feedback, recommendations_accepted, recommendations_discarded } = req.body;
    console.log('API Gateway Server: Usage Stats Data: ', { uuid, total_uses, uses_since_last_feedback });
    if (!uuid || total_uses == null || uses_since_last_feedback == null) {
         return res.status(400).json({ error: 'SUage Stats Update: Missing required fields. Update failed' });  
    }
    try {
        const submit_usage_stats_query = `
            INSERT INTO usage_statistics (uuid, total_uses, uses_since_last_feedback, last_usage_time, recommendations_accepted, recommendations_discarded)
            VALUES ($1, $2, $3, NOW(), $4, $5)
            ON CONFLICT (uuid) DO UPDATE SET total_uses = $2, uses_since_last_feedback = $3, last_usage_time = NOW(), recommendations_accepted = $4, recommendations_discarded = $5
            RETURNING *;`;
        const client = await pool.connect();
        const result = await client.query(submit_usage_stats_query, [uuid, total_uses, uses_since_last_feedback, recommendations_accepted, recommendations_discarded]);
        client.release();
        console.log('API Gateway Server: Usage Stats Submitted Successfully: ', result.rows[0]);
        return res.json(result.rows[0]);
    } catch (error) {
        console.error('API Gateway Server: Error in submitting usage stats: ', error);
        return res.status(500).send({ message: 'Failed to submit usage stats' });
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

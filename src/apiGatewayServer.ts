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


app.post('/analyzeTone', async (req: Request, res: Response) => {
    console.log('API Gateway Server: Analyzing tone');
    const emailContent = req.body.emailContent;
    console.log('API Gateway Server: Email Content found: ', emailContent);
    //res.send({ tone: 'Tone Analysis Complete' });
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { 
                    role: "system", 
                    content: "You will be provided with a text which are contents of an email. Please check the tone of the email and give suggestions on how to tone it down. For ex. 'The tone of the email is too aggressive. Here is how you can tone it down....'"
                },
                {
                    role: "user",
                    content: emailContent
                }
            ],
            max_tokens: 1000
        });
        const tone = response.choices[0].message.content;
        //const tone = response.choices[0].text;
        console.log('API Gateway Server: Tone Analysis Result: ', tone);
        return res.json({ tone: tone });
    } catch (error) {
        console.error('API Gateway Server: Error in tone analysis: ', error);
       return res.status(500).send({ message: 'Failed to analyze tone' ,error: error });
    }
});

app.listen(port, () => {
    console.log(`API Gateway Server listening at ${api_gateway_server}:${port}`);
});

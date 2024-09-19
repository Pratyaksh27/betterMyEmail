"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
// import { Configuration, OpenAI } from 'openai';
//import Configuration from 'openai';
//import OpenAIApi from 'openai';
//import OpenAI from 'openai';
const openai_1 = require("openai");
//require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const api_gateway_server = process.env.API_GATEWAY_SERVER;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("The OPENAI_API_KEY environment variable is missing or empty.");
}
const openai = new openai_1.OpenAI({ apiKey });
app.get('/', (req, res) => {
    res.send('API Gateway Server is running');
});
app.get('/test-openai', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield openai.models.list();
        console.log('API Gateway Server: OpenAI Models: ', result);
        res.json(result);
    }
    catch (error) {
        console.error('API Gateway Server: Error in OpenAI test: ', error);
    }
}));
app.post('/analyzeEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('API Gateway Server: Analyzing Email Content...');
    const emailContent = req.body.emailContent;
    console.log('API Gateway Server: Email Content found: ', emailContent);
    try {
        const response = yield openai.chat.completions.create({
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
    }
    catch (error) {
        console.error('API Gateway Server: Error in Email analysis: ', error);
        return res.status(500).send({ message: 'Failed to analyze Email', error: error });
    }
}));
app.listen(port, () => {
    console.log(`API Gateway Server listening at ${api_gateway_server}:${port}`);
});

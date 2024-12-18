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
const db_1 = __importDefault(require("./db"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
/*
***  Analyze Email Endpoint: Receives an email content and analyzes it using OpenAI's GPT-4 model.
***  The email content is sent to the GPT-4 model for analysis along with Prompt messages.
***  The response is a JSON object containing the analysis result.
***  The analysis result is the improved email content along with the rationale for the improvements made.
***  The response is sent back to the client (extension).
*/
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
                    
                    Ensure that the JSON is valid and properly formatted. Do not include any additional text outside of the JSON block.
                    Plus there is no need to add the "Subject" line in your response. Just the email content is enough.
                    If the Receipient or Sender name is not present, do NOT add [Name] in the email content for either of them.`
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
                },
                {
                    role: "assistant",
                    content: "Remember, DONT give Subject line. Dont add [Name] if recipient or sender name is not available."
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
/*
*** submit_feedback Endpoint: Receives feedback from the user and stores it in the database.
*/
app.post('/submitFeedback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const client = yield db_1.default.connect();
        const result = yield client.query(submit_feedback_query, [uuid, rating, feedback]);
        client.release();
        console.log('API Gateway Server: Feedback Submitted Successfully: ', result.rows[0]);
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error('API Gateway Server: Error in submitting feedback: ', error);
        return res.status(500).send({ message: 'Failed to submit feedback' });
    }
}));
app.post('/submitUsageStats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid, total_uses, uses_since_last_feedback } = req.body;
    console.log('API Gateway Server: Usage Stats Data: ', { uuid, total_uses, uses_since_last_feedback });
    if (!uuid || total_uses == null || uses_since_last_feedback == null) {
        return res.status(400).json({ error: 'SUage Stats Update: Missing required fields. Update failed' });
    }
    try {
        const submit_usage_stats_query = `
            INSERT INTO usage_statistics (uuid, total_uses, uses_since_last_feedback, last_usage_time)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (uuid) DO UPDATE SET total_uses = $2, uses_since_last_feedback = $3, last_usage_time = NOW()
            RETURNING *;`;
        const client = yield db_1.default.connect();
        const result = yield client.query(submit_usage_stats_query, [uuid, total_uses, uses_since_last_feedback]);
        client.release();
        console.log('API Gateway Server: Usage Stats Submitted Successfully: ', result.rows[0]);
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error('API Gateway Server: Error in submitting usage stats: ', error);
        return res.status(500).send({ message: 'Failed to submit usage stats' });
    }
}));
app.get('/debug/routes', (req, res) => {
    const routes = app._router.stack
        .filter((layer) => layer.route) // Only include routes
        .map((layer) => { var _a; return (_a = layer.route) === null || _a === void 0 ? void 0 : _a.path; }); // Extract route paths
    res.json(routes);
});
app.listen(port, () => {
    console.log(`API Gateway Server listening at ${api_gateway_server}:${port}`);
});

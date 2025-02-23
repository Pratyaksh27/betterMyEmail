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
const toneTemplates_1 = require("./prompts/toneTemplates");
const commonPrompts_1 = require("./prompts/commonPrompts");
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
app.post('/createUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const client = yield db_1.default.connect();
        const result = yield client.query(create_user_query, [emailID, UUID]);
        client.release();
        console.log('API Gateway Server: User Created Successfully: ');
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error('API Gateway Server: Error in creating user: ', error);
        return res.status(500).send({ message: 'Failed to create user' });
    }
}));
/*
***  getUUIDFromEmail Endpoint: Receives an email ID and returns the UUID associated with the email ID.
 */
app.post("/getUUIDFromEmail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailID } = req.body;
    if (!emailID) {
        return res.status(400).json({ error: "getUUIDFromEmail Endpoint: Email ID is required" });
    }
    try {
        const query = "SELECT uuid FROM users WHERE email_id = $1";
        const result = yield db_1.default.query(query, [emailID]);
        if (result.rows.length > 0) {
            res.status(200).json({ uuid: result.rows[0].uuid });
        }
        else {
            res.status(200).json({ uuid: null });
        }
    }
    catch (error) {
        console.error("getUUIDFromEmail Endpoint: Error retrieving UUID:", error);
        res.status(500).json({ error: "getUUIDFromEmail Endpoint: Internal Server Error" });
    }
}));
/*
***  getEmailFromUUID Endpoint: Receives a uuid and returns the Email ID associated with the email ID.
 */
app.post("/getEmailFromUUID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid } = req.body;
    if (!uuid) {
        return res.status(400).json({ error: "getEmailFromUUID Endpoint: UUID is required" });
    }
    try {
        const query = "SELECT email_id FROM users WHERE uuid = $1";
        const result = yield db_1.default.query(query, [uuid]);
        if (result.rows.length > 0) {
            res.status(200).json({ emailID: result.rows[0].email_id });
        }
        else {
            res.status(200).json({ emailID: null });
        }
    }
    catch (error) {
        console.error("getEmailFromUUID Endpoint: Error retrieving Email ID:", error);
        res.status(500).json({ error: "getEmailFromUUID Endpoint: Internal Server Error" });
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
    console.log('API Gateway Server: Email Content found: ');
    const selectedTone = req.body.selectedTone || 'professional';
    const toneKey = selectedTone.toLowerCase().toString();
    const toneTemplate = toneTemplates_1.toneTemplates[toneKey] || toneTemplates_1.toneTemplates['professional'];
    console.log('API Gateway Server: Selected Tone: ', selectedTone);
    try {
        const response = yield openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.task
                },
                {
                    role: "system",
                    content: toneTemplate
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.doNotAddSignature
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.jsonFormatInstruction
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.endOfConversation
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.startOfEmailContent
                },
                {
                    role: "user",
                    content: `Beginning of email content\n\n${emailContent}\n\nEnd of email content`
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.endOfEmailContent
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.doNotAddSignature
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.onlyOutputJSON
                },
                {
                    role: "system",
                    content: commonPrompts_1.commonPrompts.doNotAddSubject
                }
            ],
            max_tokens: 1000,
            temperature: 0.3,
        });
        const analysisResult = response.choices[0].message.content;
        console.log('API Gateway Server: Email Analysis DDONE. Sending Results back ');
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
        const client = yield db_1.default.connect();
        const result = yield client.query(submit_feedback_query, [uuid, type, rating, feedback, uninstall_reason]);
        client.release();
        console.log('API Gateway Server: User Feedback Submitted Successfully: ');
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error('API Gateway Server: Error in submitting feedback: ', error);
        return res.status(500).send({ message: 'Failed to submit feedback' });
    }
}));
app.post('/submitUsageStats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid, total_uses, uses_since_last_feedback, recommendations_accepted, recommendations_discarded } = req.body;
    console.log('API Gateway Server: Usage Stats Data: ', { uuid, total_uses, uses_since_last_feedback });
    if (!uuid || total_uses == null || uses_since_last_feedback == null) {
        return res.status(400).json({ error: 'Usage Stats Update: Missing required fields. Update failed' });
    }
    try {
        const submit_usage_stats_query = `
            INSERT INTO usage_statistics (uuid, total_uses, uses_since_last_feedback, last_usage_time, recommendations_accepted, recommendations_discarded)
            VALUES ($1, $2, $3, NOW(), $4, $5)
            ON CONFLICT (uuid) DO UPDATE SET total_uses = $2, uses_since_last_feedback = $3, last_usage_time = NOW(), recommendations_accepted = $4, recommendations_discarded = $5
            RETURNING *;`;
        const client = yield db_1.default.connect();
        const result = yield client.query(submit_usage_stats_query, [uuid, total_uses, uses_since_last_feedback, recommendations_accepted, recommendations_discarded]);
        client.release();
        console.log('API Gateway Server: Usage Stats Submitted Successfully: ');
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

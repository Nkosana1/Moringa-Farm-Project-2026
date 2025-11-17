import express, { Request, Response } from 'express';
import cors from 'cors';

interface ContactPayload {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

interface ApiResponse {
    message: string;
}

const app = express();
const PORT = process.env.PORT || 4000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(cors());
app.use(express.json());

const sanitizeInput = (value?: string): string => {
    if (!value) return '';
    return value.replace(/<\/?[^>]+(>|$)/g, '').trim();
};

const validatePayload = (payload: Partial<ContactPayload>): payload is ContactPayload => {
    return Boolean(payload.name && payload.email && payload.message);
};

app.post('/api/contact', async (req: Request<{}, ApiResponse, Partial<ContactPayload>>, res: Response<ApiResponse | { error: string }>) => {
    const payload = req.body || {};

    if (!validatePayload(payload)) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const sanitizedPayload: ContactPayload = {
        name: sanitizeInput(payload.name),
        email: sanitizeInput(payload.email),
        phone: sanitizeInput(payload.phone),
        message: sanitizeInput(payload.message)
    };

    try {
        await sendTelegramMessage(sanitizedPayload);
        return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Telegram API error:', error);
        return res.status(500).json({ error: 'Unable to send your message right now.' });
    }
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

const sendTelegramMessage = async (payload: ContactPayload): Promise<void> => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        throw new Error('Telegram credentials are not set.');
    }

    const text = `📬 New Kezi Pure Inquiry:
Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone || 'Not provided'}
Message:
${payload.message}`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
            parse_mode: 'Markdown'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telegram API responded with status ${response.status}: ${errorText}`);
    }
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;


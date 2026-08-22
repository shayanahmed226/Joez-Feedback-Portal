import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, phone, email, address, taste, quality, pricing, sitting, delivery, packaging, feedback, attachment, voice } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        // OAuth 2.0 with Refresh Token
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Sheet1!A:N';

        const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

        const values = [[
            now,
            name,
            phone,
            address || '',
            email || '',
            parseInt(taste) || 0,
            parseInt(quality) || 0,
            parseInt(pricing) || 0,
            parseInt(sitting) || 0,
            parseInt(delivery) || 0,
            parseInt(packaging) || 0,
            feedback || '',
            attachment || '',
            voice || ''
        ]];

        const request = {
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        };

        await sheets.spreadsheets.values.append(request);

        return res.status(200).json({ success: true, message: 'Feedback saved successfully!' });

    } catch (error) {
        console.error('Backend Error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
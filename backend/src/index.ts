import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const pool = new Pool({

    connectionString : process.env.DATABASE_URL,

});

const oauth2Client = new google.auth.OAuth2(

    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

interface UpdatableApplicationFields {

  company_name: string,
  role_title: string,
  status: 'applied' | 'interview' | 'offer' | 'rejected',
  link: string,
  notes?: string

}

function buildUpdateQuery (id: string, body: Partial<UpdatableApplicationFields>) {

    const fields = [];

    const values = [];

    if ('company_name' in body) {

        fields.push('company_name = $' + (values.length + 1));

        values.push(body.company_name);
    }

    if ('role_title' in body ) {

        fields.push('role_title = $' + (values.length + 1));

        if (body.role_title == '') values.push('Unknown Role')
        else values.push(body.role_title); 

    }

    if ('link' in body) {

        fields.push('link = $' + (values.length + 1));

        if (body.link == '') values.push('No link provided.')
        else values.push(body.link)

    }

    if ('status' in body ) {

        fields.push('status = $' + (values.length + 1));

        values.push(body.status);
    }

    if ('notes' in body ) {

        fields.push('notes = $' + (values.length + 1));

        values.push(body.notes);
    }
    
    values.push(id);

    const setClause = fields.join(', ');

    const query = `UPDATE applications SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    
    return {query, values, fields}


}

function classifyEmail(subject: string): string {

        const lower = subject.toLowerCase();

        if (lower.includes('interview')) return 'interview';
        if (lower.includes('offer')) return 'offer';
        if (lower.includes('regret') || lower.includes('unfortunately') || lower.includes('not moving forward')) return 'rejected';
        if (lower.includes('thank you for applying') || lower.includes('application received') || lower.includes('your application')) return 'applied';
        return 'other';

    }

app.get('/', (req, res) => {
    res.send('Job Tracker API is running');
});


app.get('/applications', async (req, res) => {

    const result = await pool.query('SELECT * FROM applications');
    res.json(result.rows);

});

app.post('/applications', async (req, res) => {

    const {companyName, roleTitle, link, notes} = req.body;

    const result = await pool.query(

        'INSERT INTO applications(company_name, role_title, link, notes) VALUES ($1, $2, $3, $4) RETURNING *',
        [companyName==''? 'Unknown Company': companyName, roleTitle==''? 'Unknown Role': roleTitle, link==''? 'No link provided': link, notes==''?  'No notes provided': notes]

    );

    res.status(201).json(result.rows[0]);

});

app.delete('/applications/:id', async (req, res) => {

    const id = req.params.id

    await pool.query('DELETE FROM applications WHERE id = $1', [id]);

    res.status(204).send()


});

app.patch('/applications/:id', async (req, res) => {
    
  const { query, values, fields} = buildUpdateQuery(req.params.id, req.body);

  if (fields.length === 0) {return res.status(400).json({ error: 'No fields updated.' })}

  const result = await pool.query(query, values);
  res.json(result.rows[0]);
});

app.get('/auth/google', async (req, res) => {

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', 
        scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'openid',
        'email'
        ],
        prompt: 'consent'
    
    });

    res.redirect(url)


});

app.get('/auth/google/callback', async (req, res) => {

    const code = req.query.code as string;

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {

        res.status(400).send('No refresh token received - try disconnecting and reconnecting Gmail.');
        return;

    }

    if (!tokens.id_token) {

        res.status(400).send('No id token received.')
        return;

    }

    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({

        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID!

    });

    const email = ticket.getPayload()?.email;

    if (!email) {

        res.status(400).send('No email received.')
        return;

    }

    await pool.query('INSERT INTO gmail_tokens (user_account, refresh_token) VALUES ($1, $2) ON CONFLICT (user_account) DO UPDATE SET refresh_token = EXCLUDED.refresh_token', 
        [email, tokens.refresh_token]
    );

    res.redirect('http://localhost:5173/');

});

app.get('/gmailId/:id', async (req, res) => {

    console.log('Received id:', req.params.id, '→ parsed:', parseInt(req.params.id));
    const primary_key = parseInt(req.params.id);
    const result = await pool.query('SELECT gmail_message_id FROM applications WHERE id = $1', [primary_key]);
    console.log('Result:', result.rows[0]);
    res.json(result.rows[0]?.gmail_message_id);

})

app.get('/sync', async (req, res) => {

    const result = await pool.query('SELECT refresh_token FROM gmail_tokens LIMIT 1');

    const refresh_token = result.rows[0]?.refresh_token;

    if (!refresh_token) {

        console.log('No refresh token received.');
        return;

    }

    oauth2Client.setCredentials({refresh_token: refresh_token!});

    // Start retrieving messages from user's gmail

    const gmail = google.gmail({version:'v1', auth: oauth2Client});

    const response = await gmail.users.messages.list({

        userId: 'me',
        q: 'subject:("Thank you for applying" OR interview OR "Your application" OR offer) after:2026/01/01 category:primary',
        maxResults: 50

    });

    const messages = response.data.messages

    if (!messages) {

        res.json({message: 'No emails received.'})
        return;

    }

    const emailDetails = await Promise.all(
        
        messages.map(async (msg) => {

        const response = await gmail.users.messages.get({

            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date']

        })

        const snippet = response.data.snippet ?? '';

        const headers = response.data.payload?.headers ?? [];

        const subject = headers.find((h) => h.name === 'Subject')?.value ?? 'No Subject';

        const from = headers.find((h) => h.name === 'From')?.value ?? 'Unknown';

        const date = headers.find((h) => h.name === 'Date')?.value ?? '';

        return {id: msg.id!, snippet, subject, from, date};

    }))

    await Promise.all(

        emailDetails.map((email) => ({ // Create a new shape for the existing object.

            ...email,
            status: classifyEmail(email.subject),
            company_name: email.from.split('<')[0]?.trim() ?? 'Unknown Company',
            link: 'No link provided.',
                        
        }))
        .filter((email) => email.status !== 'other') // filter out emails with status value 'other'
        .map(async (email) => { // wait for each new shaped object to be done being inserted in the applications table

            await pool.query(`
                    INSERT INTO applications(company_name, status, applied_date, notes, gmail_message_id, link) 
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (gmail_message_id) DO NOTHING`, 
                    [email.company_name, email.status, email.date? new Date(email.date): new Date(), email.snippet, email.id, email.link]
                );



        })



    )

    console.log('Messages found:', messages?.length);

    res.json({message: 'Sync complete!'});

});

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
    
});


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

        values.push(body.role_title);
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

app.get('/', (req, res) => {
    res.send('Job Tracker API is running');
});


app.get('/applications', async (req, res) => {

    const result = await pool.query('SELECT * FROM applications');
    res.json(result.rows);

});

app.post('/applications', async (req, res) => {

    const {companyName, roleTitle, notes} = req.body;

    const result = await pool.query(

        'INSERT INTO applications(company_name, role_title, notes) VALUES ($1, $2, $3) RETURNING *',
        [companyName, roleTitle, notes==''?  'No notes provided': notes]

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

    const url = oauth2Client.generateAuthUrl({access_type: 'offline', scope: ['https://www.googleapis.com/auth/gmail.readonly']});

    res.redirect(url);


});

app.get('/auth/google/callback', async (req, res) => {

    const code = req.query.code as string;

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {

        res.status(400).send('No refresh token received - try disconnecting and reconnecting Gmail.');
        return;

    }

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    await pool.query('INSERT INTO gmail_tokens (user_account, refresh_token) VALUES ($1, $2) ON CONFLICT (user_account) DO UPDATE SET refresh_token = EXCLUDED.refresh_token', 
        [email, tokens.refresh_token]
    );

    res.redirect('http://localhost:5173/');

});

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
    
});


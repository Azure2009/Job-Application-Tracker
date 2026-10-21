import argon2 from 'argon2';
import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import { google } from 'googleapis';
import he from 'he';

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) throw new Error('FRONTEND_URL was not set.');

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {

    throw new Error('SESSION_SECRET was not set.')

}

const pool = new Pool({

    connectionString : process.env.DATABASE_URL,
    // ssl: {

    //     rejectUnauthorized: false

    // }

});

const app = express();
const PORT = 3000;

const sessionStore = connectPgSimple(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({

    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true

}));

app.set('trust proxy', 1);

app.use(session({

    store: new sessionStore({

        pool: pool,
        tableName: 'sessions',
        createTableIfMissing: true

    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {

        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 

    }

}));

function createOAuthClient() {

   return new google.auth.OAuth2(

    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

}

interface UpdatableApplicationFields {

  company_name: string,
  role_title: string,
  status: 'applied' | 'interview' | 'offer' | 'rejected',
  link: string,
  notes?: string

}

function buildUpdateQuery (id: string, userId: string | number, body: Partial<UpdatableApplicationFields>) {

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
    values.push(userId);

    const setClause = fields.join(', ');

    const query = `UPDATE applications SET ${setClause} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`;
    
    return {query, values, fields};


}

function classifyEmail(subject: string): string {

    const lower = subject.toLowerCase();

    if (lower.includes('interview')) return 'interview';
    if (lower.includes('offer')) return 'offer';
    if (lower.includes('regret') || lower.includes('unfortunately') || lower.includes('not moving forward')) return 'rejected';
    if (lower.includes('thank you for applying') || lower.includes('application received') || lower.includes('your application')) return 'applied';
    return 'other';

}

function normalizeEmail(email: string) {

    const cleanEmail = email.trim().toLowerCase();

    return cleanEmail;

}

async function hashPassword(password: string) {
    
    try {
        
        const hash = await argon2.hash(password, {

            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 4

        });

        return hash;

    } catch (err) {

        throw new Error('Password hashing failed');

    }

}

async function verifyPassword(password_hashed:string , password: string): Promise<boolean> {

    const isValid = await argon2.verify(password_hashed, password)

    return isValid;

}

function requiresAuth(req: Request, res: Response, next: NextFunction) {
    
    if (req.session.userId === undefined) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    next();

}

app.get('/', (req, res) => {
    res.send('Job Tracker API is running');
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.' }
});

app.use('/login', authLimiter);
app.use('/register', authLimiter);

app.post('/register', async (req, res) => {

    const { fullName, email, password, confirmPassword } = req.body;

    if (

        typeof fullName !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof confirmPassword !== 'string'

    ) {

        return res.status(400).json({ message: 'Invalid request.' });

    }

    if (password.length < 8 || password.length > 128) {

        return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });

    }

    const email_cleaned = normalizeEmail(email);

    if (password !== confirmPassword) {

        return res.status(400).json({

            message: 'Passwords do not match.'

        });

    }

    if (typeof password === 'string' && password.length < 8) {

        return res.status(400).json({

            message: 'Password must be at least 8 characters long.'

        });

    }

    try {
        
        const password_hashed = await hashPassword(password);

        await pool.query(

            'INSERT INTO users(full_name, email, password_hash) VALUES ($1, $2, $3)',
            [fullName, email_cleaned, password_hashed]

        );

        return res.status(201).json({
                        
            message: 'Registered successfully!'

        });

    } catch (error: unknown) {

        if (typeof error === 'object' && error !==null) {
            
            if ('code' in error && 'constraint' in error) {

                if (error.code === '23505' && error.constraint === 'users_email_key') {

                    return res.status(409).json({

                        message: 'An account is already associated with this email.'

                    });

                }

            }

        }

        return res.status(500).json({

            message: 'Something went wrong. Please try again.'

        });

    }

});

app.post('/login', async (req, res) => {

    const {email, password} = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {

        return res.status(400).json({ message: 'Invalid request.' });

    }

    try {

        const emailCleaned = email.trim().toLowerCase();
        
        const result = await pool.query(

            'SELECT id, password_hash FROM users WHERE email = $1',
            [emailCleaned]

        )
        
        // Kapag walang binalik si query
        if (result.rows.length === 0) {

            return res.status(401).json({
                
                message: 'Invalid email or password.'

            });

        }

        // Kapag may binalik, get the password_hash from the first row then verify 
        const password_hashed = result.rows[0].password_hash;

        const isValid = await verifyPassword(password_hashed, password)

        if (!isValid) {

            return res.status(401).json({
                
                message: 'Invalid email or password.'
            
            });

        }

        req.session.regenerate((err) => {
            
            if (err) {

                return res.status(500).json({

                    message: 'Something went wrong. Please try again.'

                });
            
            }
            
            req.session.userId = result.rows[0].id;

            req.session.save((err) => {
                
                if (err) {

                    return res.status(500).json({

                        message: 'Something went wrong. Please try again.'

                    });
                
                }
                
                return res.status(200).json({

                    message: 'Signed in successfully!'

                })
            
            });
        
        });

        

    } catch (error: unknown) {

        console.error(error);
        
        return res.status(500).json({
            
            message: 'Something went wrong. Please try again.'
        
        });

    }

});

app.use(requiresAuth); // Everything after this line, requires authentication.

app.get('/me', async (req, res) => {

    try {

        const result = await pool.query(

            'SELECT id, full_name, email FROM users WHERE id = $1',
            [req.session.userId]

        );

        if (result.rows.length === 0) {

            return res.status(401).json({ message: 'Not authenticated.' });

        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Something went wrong.' });

    }
});

app.post('/logout', (req, res) => {

    req.session.destroy((err) => {
        
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something went wrong.' });
        }

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ message: 'Logged out.' });
    });

});

app.get('/applications', async (req, res) => {

    const result = await pool.query(
        'SELECT * FROM applications WHERE user_id = $1',
        [req.session.userId]
    );
    res.json(result.rows);

});

app.post('/applications', async (req, res) => {

    const {companyName, roleTitle, link, notes} = req.body;

    const result = await pool.query(

        'INSERT INTO applications(user_id, company_name, role_title, link, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [req.session.userId, companyName==''? 'Unknown Company': companyName, roleTitle==''? 'Unknown Role': roleTitle, link==''? 'No link provided': link, notes==''?  'No notes provided': notes]

    );

    res.status(201).json(result.rows[0]);

});

app.delete('/applications/:id', async (req, res) => {

    const result = await pool.query(
        'DELETE FROM applications WHERE id = $1 AND user_id = $2',
        [req.params.id, req.session.userId]
    );

    if (!result.rowCount) {
        return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(204).send();

});

const ALLOWED_STATUSES = ['applied', 'interview', 'offer', 'rejected'];

app.patch('/applications/:id', async (req, res) => {

    if ('status' in req.body && !ALLOWED_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }
    
    const { query, values, fields } = buildUpdateQuery(req.params.id, req.session.userId!, req.body);

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields updated.' });
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found.' });
    }

    res.json(result.rows[0])
    
});

app.get('/auth/google', async (req, res) => {

    const state = crypto.randomBytes(32).toString('hex');
    req.session.oauthState = state;

    req.session.save((err) => {

        if (err) {

            return res.status(500).json({ message: 'Something went wrong.' });

        }

        const url = createOAuthClient().generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'openid',
                'email',
                'profile'
            ],
            prompt: 'consent',
            state
        });

        res.redirect(url);

    });

});

app.get('/auth/google/callback', async (req, res) => {

    const { code, state } = req.query;

    const expected = req.session.oauthState;
    delete req.session.oauthState;

    if (typeof code !== 'string' || typeof state !== 'string' || !expected || state !== expected) {
        return res.status(400).send('Invalid OAuth request.');
    }

    try {

        const client = createOAuthClient();
        const { tokens } = await client.getToken(code);

        if (!tokens.refresh_token || !tokens.id_token) {
            return res.status(400).send('Google did not return the expected tokens - try disconnecting and reconnecting Gmail.');
        }

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID!
        });

        const payload = ticket.getPayload();

        if (!payload?.email) {
            return res.status(400).send('No email received.');
        }

        await pool.query(
            `INSERT INTO gmail_tokens (user_id, user_account, refresh_token, profile_picture) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET user_account = EXCLUDED.user_account, refresh_token = EXCLUDED.refresh_token, profile_picture = EXCLUDED.profile_picture`,
            [req.session.userId, payload.email, tokens.refresh_token, payload.picture]
        );

        res.redirect(`${frontendUrl}/dashboard`);

    } catch (error) {

        console.error(error);
        res.status(500).send('Could not connect Gmail.');

    }

});

app.get('/gmail-profile', async (req, res) => {

    const result = await pool.query(

        'SELECT user_account, profile_picture FROM gmail_tokens WHERE user_id = $1',
        [req.session.userId]

    );

    res.json(result.rows[0] ?? null);

})

app.get('/gmailId/:id', async (req, res) => {

    const result = await pool.query(

        'SELECT gmail_message_id FROM applications WHERE id = $1 AND user_id = $2',
        [req.params.id, req.session.userId]

    );

    if (result.rows.length === 0) {

        return res.status(404).json({ message: 'Not found.' });

    }

    res.json({ gmail_message_id: result.rows[0].gmail_message_id });

})

app.get('/sync', async (req, res) => {

    try {
        
        const tokenResult = await pool.query(

            'SELECT refresh_token FROM gmail_tokens WHERE user_id = $1',
            [req.session.userId]
            
        );

        const refresh_token = tokenResult.rows[0]?.refresh_token;

        if (!refresh_token) {
            return res.status(400).json({ error: 'No Gmail account connected' });
        }

        const client = createOAuthClient();
        client.setCredentials({ refresh_token });

        const gmail = google.gmail({ version: 'v1', auth: client });

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

                await pool.query(
                    
                `INSERT INTO applications(user_id, company_name, status, applied_date, notes, gmail_message_id, link)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id, gmail_message_id) DO NOTHING`,
                [req.session.userId, email.company_name, email.status, email.date ? new Date(email.date) : new Date(), he.decode(email.snippet), email.id, email.link]

                );

            })

        )

        console.log('Messages found:', messages?.length);

        res.json({message: 'Sync complete!'});

    } catch (err) {
        console.error('Sync failed:', err);

        if (err instanceof Error && err.message.includes('invalid_grant')) {

            await pool.query('DELETE FROM gmail_tokens WHERE user_id = $1', [req.session.userId]);
            return res.status(400).json({ error: 'Gmail access expired. Please reconnect.' });

        }

        res.status(500).json({ error: 'Sync failed.' });
    }

});

app.post('/gmail/disconnect', async (req, res) => {

    const result = await pool.query(

        'SELECT refresh_token FROM gmail_tokens WHERE user_id = $1',
        [req.session.userId]

    );

    const refresh_token = result.rows[0]?.refresh_token;

    if (refresh_token) {

        try {
            await createOAuthClient().revokeToken(refresh_token);
        } catch (err) {
            console.error('Token revoke failed:', err);
        }

    }

    await pool.query('DELETE FROM gmail_tokens WHERE user_id = $1', [req.session.userId]);
    await pool.query(

        'DELETE FROM applications WHERE user_id = $1 AND gmail_message_id IS NOT NULL',
        [req.session.userId]

    );

    const queryResult = await pool.query(

        'SELECT * FROM applications WHERE user_id = $1',
        [req.session.userId]

    );

    res.json({ message: 'Gmail disconnected.', applications: queryResult.rows });

})

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {

    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({ message: 'Something went wrong.' });

});

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
    
});


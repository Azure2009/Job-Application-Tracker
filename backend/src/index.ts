import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const pool = new Pool({

    connectionString : process.env.DATABASE_URL,

});

app.get('/', (req, res) => {
    res.send('Job Tracker API is running');
});


app.get('/applications', async (req, res) => {

    const result = await pool.query('SELECT * FROM applications');
    res.json(result.rows);

});

app.post('/applications', async (req, res) => {

    const {company_name, role_title} = req.body;

    const result = await pool.query(

        'INSERT INTO applications(company_name, role_title) VALUES ($1, $2) RETURNING *',
        [company_name, role_title]

    );

    res.status(201).json(result.rows[0]);

});


app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
    
});
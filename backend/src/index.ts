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

    const {companyName, roleTitle, notes = null} = req.body;

    const result = await pool.query(

        'INSERT INTO applications(company_name, role_title, notes) VALUES ($1, $2, $3) RETURNING *',
        [companyName, roleTitle, notes]

    );

    res.status(201).json(result.rows[0]);

});

app.delete('/applications/:id', async (req, res) => {

    const id = req.params.id

    await pool.query('DELETE FROM applications WHERE id = $1', [id]);

    res.status(204).send()


})

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
    
});
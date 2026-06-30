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

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);
    
});


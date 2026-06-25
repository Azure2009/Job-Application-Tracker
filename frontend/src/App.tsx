import { useState, useEffect } from 'react';

interface Application {

  id: number,
  company_name: string,
  role_title: string,
  status: 'applied' | 'interview' | 'offer' | 'rejected',
  applied_date: string,
  notes?: string

}

function formatStatus(status: string): string {

  const trimmed = status.trim();

  const first_letter = trimmed[0].toUpperCase();
  const result = first_letter.concat(trimmed.slice(1));

  return result;

}

function daysSinceApplied(d: string): number {

  const applied_date = new Date(d);

  const date_now =  new Date();

  const diffMs = date_now.getTime() - applied_date.getTime();

  return Math.floor(diffMs/ (1000 * 60 * 60 * 24));

}



function App() {

  const [applications, setApplications] = useState<Application[]>([]);

  const [isHidden, setIsHidden] = useState<boolean>(true);

  const [companyName, setCompanyName] = useState<string>('');

  const [roleTitle, setRoleTitle] = useState<string>('');

  const [notes, setNotes] = useState<string>('');

  useEffect(() => {

    fetch(`http://localhost:3000/applications`)
    .then((res) => res.json())
    .then((data) => setApplications(data))

  }, []);

  async function deleteApplication (id: number) {

  fetch(`http://localhost:3000/applications/${id}`, 
    {
      method: 'DELETE'

  })
  .then(() => setApplications((prev) => prev.filter((app) => app.id !== id)))
  
}

  return (
    <div>
      <h1>Job Application Tracker</h1>
      <input type='button' value='Add New Application' onClick={() => setIsHidden(false)}/>
      <ul>
        {applications.map((app) => (
          <li key={app.id}>
            {app.company_name} - 
            {app.role_title} ({formatStatus(app.status)}) - 
            {app.notes = 'no reply yet'} - 
            Days Since Applied: {daysSinceApplied(app.applied_date)}
            <input type='button' value='Delete' onClick={() => deleteApplication(app.id)}/> 
          </li>
        ))}
      </ul>

      <div className='newApplicationForm' hidden={isHidden}>

        <form onSubmit={ async (event) => {

          event.preventDefault();

          fetch(`http://localhost:3000/applications`, {
            method: 'POST', 
            headers: {

              'Content-Type': 'application/json'

            },
            body: JSON.stringify({

              companyName,
              roleTitle,
              notes

            })
          
          })
          .then((res) => res.json())
          .then((newApp) => setApplications((prev) => [...prev, newApp]))
          .then(() => {

            setCompanyName(''); 
            setRoleTitle(''); 
            setNotes(''); 
            setIsHidden(true);
          
          })

        }}>
        
          <label htmlFor='company_name'>Company Name</label>
          <input 
          type='text' 
          name='company_name' 
          id='company_name'
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          />

          <label htmlFor='role_title'>Role Title</label>
          <input 
          type='text' 
          name='role_title' 
          id='role_title'
          value={roleTitle}
          onChange={(event) => setRoleTitle(event.target.value)}
          />

          <label htmlFor='notes'>Notes(Optional)</label>
          <textarea 
          name='notes'
          id='notes'
          value={notes ?? ''}
          onChange={(event) => setNotes(event.target.value)}> 
          </textarea>

          <input type='submit' value='Submit'/>

        </form>

        <input type='button' value='Cancel' onClick={() => setIsHidden(true)}/>

      </div>

    </div>
  )
}

export default App
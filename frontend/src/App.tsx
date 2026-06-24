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

  const [visibility, setVisibility] = useState(true);

  useEffect(() => {

    fetch(`http://localhost:3000/applications`)
    .then((res) => res.json())
    .then((data) => setApplications(data))

  }, []);

  return (
    <div>
      <h1>Job Application Tracker</h1>
      <input type="button" value="Add New Application" onClick={() => setVisibility(false)}/>
      <ul>
        {applications.map((app) => (
          <li key={app.id}>
            {app.company_name} - {app.role_title} ({formatStatus(app.status)}) - {app.notes = 'no reply yet'} - Days Since Applied: {daysSinceApplied(app.applied_date)} 
          </li>
        ))}
      </ul>

      <div className='newApplicationForm' hidden={visibility}>

        <form>

          <textarea name="company_name" id="company_name"></textarea>

          <textarea name="role_title" id="role_title"></textarea>

          <textarea name="notes" id="notes"></textarea>

        </form>

      </div>

    </div>
  )
}

export default App
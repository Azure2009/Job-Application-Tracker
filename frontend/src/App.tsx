import { useState, useEffect } from 'react';
import { List, Table2, Plus, Columns2, TextAlignJustify } from 'lucide-react'


interface Application {

  id: number,
  company_name: string,
  role_title: string,
  status: 'applied' | 'interview' | 'offer' | 'rejected',
  applied_date: string,
  notes?: string

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

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingDraft, setEditingDraft] = useState< Application | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  async function sync() {

  setIsSyncing(true);
  await fetch(`http://localhost:3000/sync`)
  .then(() => fetch(`http://localhost:3000/applications`))
  .then((res) => res.json())
  .then((apps) => {
    setApplications(apps);
    setIsSyncing(false);
  })

  }

  function connectGmail() {

    window.location.href = 'http://localhost:3000/auth/google';
    
  }

  function resetForm() {

    setCompanyName('');
    setRoleTitle('')
    setNotes('')
    setIsHidden(true)

  }

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

  async function updateStatus (id: number, status: string) {

  fetch(`http://localhost:3000/applications/${id}`, 
    {
      method: 'PATCH',
      headers: {

        'Content-Type': 'application/json'

      },  
      body: JSON.stringify({

        status

      })
       
  }).then((res) => res.json())
    .then((updatedApp) => {

      setApplications((prev) => prev.map((app) =>

        app.id === id? updatedApp : app 

      ))

    })
  
  
}

  async function saveEdit(id: number) {

    fetch(`http://localhost:3000/applications/${id}`, {

      method: 'PATCH',
      headers: {

        'Content-Type' : 'application/json'

      }, 
      body: JSON.stringify({

        company_name : editingDraft?.company_name,
        role_title : editingDraft?.role_title,
        notes: editingDraft?.notes

      })


    })
    .then((res) => res.json())
    .then((updatedApp) => {

      setApplications((prev) => prev.map((app) =>

        app.id === id? updatedApp : app 

      ))
      setEditingId(null)
      setEditingDraft(null)

    })

  }
  
  return (
    <>
      
      <div className='flex items-center justify-between p-4'>
        <p className="text-3xl">Job Application Tracker</p>
        <button className='cursor-pointer text-slate-500' onClick={() => setIsOpen(true)}>
          <TextAlignJustify/>
        </button>        
      </div>
      <div className='m-4 flex'> 
        <button className='flex text-white cursor-pointer border-solid rounded-xl items-center bg-indigo-500 p-2' onClick={() => setIsHidden(false)}><Plus/><p className='text-xl'>New Job</p></button>        
        
      </div>

      <aside className={`fixed top-0 right-0 z-10 h-full w-10% bg-indigo-500 transition-transform duration-300 ease-out p-4 ${isOpen? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='p-2 flex h-10 items-center text-2xl text-slate-400'>
          <button className='ml-auto cursor-pointer' onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className='grid h-1/3 justify-items-start text-5xl text-white p-2'>
          <button className='flex items-center cursor-pointer'><Columns2/></button>
          <button className='flex items-center cursor-pointer'><List/></button>
          <button className='flex items-center cursor-pointer'><Table2/></button>
        </div>
      </aside>

      
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
          .then(() => {resetForm()})

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

        <input type='button' value='Cancel' onClick={() => {
          
          const userConfirmed = confirm('Are you sure you want to cancel? Your input will be lost.');
          
          if (userConfirmed) {
            
            resetForm()

          }}}/>

      </div>
      
      <div className='applications'>

      <ul>
        {applications.map((app) => (  

          <li key={app.id}>
            {editingId === app.id ? 
            
            <>
            <input
            type='text'
            id='company_name' 
            value={editingDraft?. company_name ?? ''}
            onChange={(event) => setEditingDraft({...editingDraft!, company_name : event.target.value})}  
            />

            <input
            type='text'
            id='role_title' 
            value={editingDraft?. role_title ?? ''}
            onChange={(event) => setEditingDraft({...editingDraft!, role_title : event.target.value})}  
            />

            <input
            type='text'
            id='notes' 
            value={editingDraft?. notes ?? ''}
            onChange={(event) => setEditingDraft({...editingDraft!, notes : event.target.value})}  
            />

            <input 
            type="button" value="Cancel" 
            onClick={() => {

              setEditingId(null);

              setEditingDraft(null);

            }}
            />

            <input 
            type="button" value="Save" 
            onClick={() => {

              if (editingId !== null) {

                saveEdit(editingId);
                
              }

            }}
            />

            </>
            
            : 
            
            <> 
            {app.company_name} - 
            {app.role_title} <select name="statuses" id="statuses" value={app.status}
            onChange={(event) => {

              updateStatus(app.id, event.target.value);

            }}>
            <option value='applied'>applied</option>
            <option value='interview'>interview</option>
            <option value='offer'>offer</option>
            <option value='rejected'>rejected</option>
            </select> - 
            {app.notes} - 
            Days Since Applied: {daysSinceApplied(app.applied_date)}
            <input type='button' value='Delete' onClick={() => {
              
              const deleteConfirmed = confirm('Are you sure you want to delete the application? This cannot be undone.');
              
              if (deleteConfirmed) {

                deleteApplication(app.id);

              }

              }}/>
 
            <input type="button" value="Edit" onClick={() => {

              setEditingId(app.id);

              setEditingDraft({...app});

            }}/>
            </>
            
            }
             
          </li>
        ))}
      </ul>
      </div>
      <input type="button" value="Sync now" onClick={() => {sync()}}/>
      {isSyncing && <span className='spinner'></span>}
      <input type="button" value="Connect a gmail account" onClick={() => connectGmail()}/>
    </>
  )
}

export default App
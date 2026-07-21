import { useState, useEffect } from 'react';
import {  Mail, Link, ReceiptText, MoveUp, RotateCcw, Search, List, Table2, Plus, Columns2, TextAlignJustify, Info } from 'lucide-react'

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

  const [checkingId, setCheckingId] = useState<number | null>(null);

  const [editingDraft, setEditingDraft] = useState< Application | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [showButton, setShowButton] = useState<boolean>(false);


  // Show Button when scrolled too far down.
  useEffect(() => {

    function handleScroll() {

      setShowButton(window.scrollY > 300);

    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, [])

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

  async function getGmailId(id: number) {

    await fetch(`http://localhost:3000/gmailId`, {
      method: 'GET',

      headers: {
        'Content-Type':'/application/json'},

      body: JSON.stringify(id)})
    .then((res) => res.json())


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

  function categorizeApps (status: string) {

    return (

      
      applications.filter((app) => app.status === status)
      .map((filteredApp) => (
        
        <li key={filteredApp.id}>
                {editingId === filteredApp.id ? 
                
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
                <div className='grid grid-cols-3 rounded-xl p-2 mb-4 bg-white gap-2 w-64'>                    
                  <div className='col-start-1 col-span-2'>{filteredApp.company_name}</div>
                  <div className='col-start-3 row-start-1 row-end-[-1] pr-auto'><Info className='ml-auto rounded-xl bg-indigo-500 text-white cursor-pointer' onClick={() => setCheckingId(filteredApp.id)}/></div>
                  <div className='col-start-1 col-span-2 text-lg font-bold'>{filteredApp.role_title}</div> 
                  {/* <select name="statuses" id="statuses" value={filteredApp.status}
                  onChange={(event) => {

                    updateStatus(filteredApp.id, event.target.value);

                  }}>
                  <option value='applied'>applied</option>
                  <option value='interview'>interview</option>
                  <option value='offer'>offer</option>
                  <option value='rejected'>rejected</option>
                  </select> - 
                  {filteredApp.notes} -  */}
                  <div className='col-start-1 col-span-2 text-slate-500 text-xs'>Applied {daysSinceApplied(filteredApp.applied_date)} days ago</div>
                  <div className='col-start-1 col-span-2 text-xs text-slate-500 items-center'>
                  <button className='mr-2 bg-slate-200 cursor-pointer p-2 z-10 rounded-xl' onClick={() => {
                    
                    const deleteConfirmed = confirm('Are you sure you want to delete the application? This cannot be undone.');
                    
                    if (deleteConfirmed) {

                      deleteApplication(filteredApp.id);

                    }

                    }}>Delete</button>

                  <button className='bg-slate-200 cursor-pointer p-2 z-10 rounded-xl' onClick={() => {

                    setEditingId(filteredApp.id);

                    setEditingDraft({...filteredApp});

                  }}>Edit</button>

                  </div>

                </div>

                <div className={`fixed z-20 w-2xl rounded-xl bg-slate-200 p-2 top-50 left-110 transition-[opacity,visibility] duration-300 ${checkingId === filteredApp.id? 'opacity-100 visible ' : 'opacity-0 invisible'}`}>
                  <div className='flex'>                                        
                    <button className='ml-auto mr-2 text-slate-500 cursor-pointer' onClick={() => setCheckingId(null)}>✕</button>
                  </div>
                  <div className='flex mb-2 text-4xl items-center'>
                    <p className='mr-4'>{filteredApp.role_title}</p>
                    {status =='applied' && <Link className='mt-auto mb-1 text-slate-600 cursor-pointer transition-text duration-300 hover:text-indigo-500'/>}
                    {status !== 'applied' && <Mail className='mt-auto mb-1 text-slate-600 cursor-pointer transition-text duration-300 hover:text-indigo-500'/>} 
                  </div>
                  <div className='flex pb-2 items-center border-b-slate-400 border-b-2 mr-2'>
                    <p className='text-2xl'>{filteredApp.company_name}</p>
                    <p className='ml-auto text-slate-500'>Status: {status}</p>
                  </div>
                  <div className='flex mt-2 mb-2 items-center'>
                    <ReceiptText className='text-indigo-500'/>
                    <p className='text-xl'>Details</p>
                  </div>
                  <div className='flex p-2 indent-6'>
                    {filteredApp.notes}
                  </div>                              
                </div>

                </>
                
                }
                
        </li>

        


      ))

  )

  }

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
      {/* header */}
      <div className='flex relative items-center justify-between p-4'>
        <p className="text-3xl">Job Application Tracker</p>
        <button className='absolute flex items-center left-300 cursor-pointer text-slate-700 p-2 rounded-full text-lg justify-center text-slate-500 border-none hover:text-indigo-500 transition-text duration-300' onClick={() => connectGmail()}>Connect gmail</button>
        <div className='relative'>
        <Search className='absolute text-slate-500 left-3 top-1/2 -translate-y-1/2'/>
        <input type="text" className='rounded-full shadow-lg p-2 pl-10 inline-lg outline-none text-slate-500' placeholder='Search'/>
        </div>

        {/* Side panel button */}
        <button className='cursor-pointer text-slate-500' onClick={() => setIsOpen(true)}>
          <TextAlignJustify/>
        </button>        
      </div>
       
      {/* Add a new job button */}
      <button className='m-4 flex text-slate-500 cursor-pointer border-solid border rounded-full items-center outline-indigo-500 outline-2 p-2' onClick={() => setIsHidden(false)}><Plus/> <p>New Job</p></button>

      {/* button for returning to top */}
      <button className={`fixed left-10 bottom-10 cursor-pointer rounded-xl text-white bg-indigo-500 p-2 transition-[opacity,visibility] duration-300 ${showButton? 'opacity-100 visible': 'opacity-0 invisible'}`} onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth'})}><MoveUp/></button>

      {/* Overlay a blackened screen when add application window is open */}
      <div className={`fixed z-4 top-0 left-0 h-1000 w-1000 bg-black/75 transition-[opacity,visibility] duration-300 ${isHidden? 'opacity-0 invisible' : 'opacity-100 visible'}`}></div>

      {/* side panel */}
      <aside className={`fixed top-0 right-0 z-10 h-full w-10% bg-indigo-500 transition-transform duration-300 ease-out p-4 ${isOpen? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='p-2 flex h-10 relative items-center text-xl self-center text-slate-400'>
          <button className='absolute left-3 cursor-pointer' onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className='grid relative h-1/3 text-5xl text-white p-2'>
          <div className='relative self-center group'>
            <button className='flex items-center cursor-pointer'><Columns2/></button>
            <div className='p-2 absolute -translate-y-1/2 bottom-1/2 right-14 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>Column</div>
          </div>
          <div className='relative self-center group'>
            <button className='flex items-center cursor-pointer'><List/></button>
            <div className='p-2 absolute -translate-y-1/2 bottom-1/2 right-14 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>List</div>
          </div>
          <div className='relative self-center group'>
            <button className='flex items-center cursor-pointer'><Table2/></button>
            <div className='p-2 absolute -translate-y-1/2 bottom-1/2 right-14 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>Table</div>
          </div>
        </div>
        <div className='m-2 flex relative top-96 group'>
          <div className='p-2 absolute text-xs bg-black text-white bottom-1/2 -translate-y-1/2 right-14 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none'>Sync</div>
          <button className={`text-white cursor-pointer ${isSyncing? 'animate-spin [animation-direction:reverse]':''}`} onClick={() => sync()}><RotateCcw/></button>          
          </div>
      </aside>


      {/* the 4 categories */}
      <div className='grid grid-cols-4 ml-32 mr-24 gap-4'>

        <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2'>Applied</p><ul>{categorizeApps('applied')}</ul></div>
        <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2'>Interview</p><ul>{categorizeApps('interview')}</ul></div>
        <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2'>Rejected</p><ul>{categorizeApps('rejected')}</ul></div>
        <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2'>Offered</p><ul>{categorizeApps('offer')}</ul></div>


      </div>

      {/* application */}
      <div className={`fixed z-20 w-6xl rounded-xl bg-slate-200 top-50 left-50 transition-[opacity,visibility] duration-300 ${isHidden? 'opacity-0 invisible': 'opacity-100 visible'}`}>

          <form className='grid grid-cols-2 p-4 gap-x-4' onSubmit={ async (event) => {

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
            
            
              <label className='text-slate-500' htmlFor='company_name'>Company Name</label>
            
            
              <label className='text-slate-500' htmlFor='role_title'>Role Title</label>
            
              <input className='rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none p-2'
              autoComplete='off'
              type='text' 
              name='company_name' 
              id='company_name'
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              />
              <input className='rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none p-2'
              type='text' 
              name='role_title' 
              id='role_title'
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
              />

            <label className='col-span-2 mt-4 text-slate-500' htmlFor='notes'>Notes(Optional)</label>
            <textarea
            autoComplete='off'
            className='resize-none col-span-2 rounded-xl border-2 border-slate-300 mb-4 focus:border-indigo-500 focus:outline-none p-2' 
            name='notes'
            id='notes'
            value={notes ?? ''}
            onChange={(event) => setNotes(event.target.value)}> 
            </textarea>

            <input className='cursor-pointer rounded-full bg-slate-300 p-2 col-span-2' type='button' value='Cancel' onClick={() => {            
              const userConfirmed = confirm('Are you sure you want to cancel? Your input will be lost.');            
              if (userConfirmed) {
                resetForm()
            }}}/>

            <input className='border rounded-full p-2 bg-indigo-500 text-white col-span-2 cursor-pointer' type='submit' value='Submit'/>
            
          </form>          

        </div>
      
    </>
  )
}

export default App
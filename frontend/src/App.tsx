import { useState, useEffect } from 'react';
import { LogOut, MessageSquareCheck, UserRoundX, MessagesSquare, SquarePen, Trash2, Mail, Link, ReceiptText, MoveUp, RotateCcw, Search, List, Plus, Columns2, TextAlignJustify, Info, FileUser } from 'lucide-react'

interface Application {

  id: number,
  company_name: string,
  role_title: string,
  status: 'applied' | 'interview' | 'offer' | 'rejected',
  applied_date: string,
  link: string,
  notes?: string

}

// For toggling between column and list view

type ViewType = 'column' | 'list'

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

  const [link, setLink] = useState<string>('');

  const [notes, setNotes] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);

  const [checkingId, setCheckingId] = useState<number | null>(null);

  const [editingDraft, setEditingDraft] = useState< Application | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [showButton, setShowButton] = useState<boolean>(false);

  const [view, setView] = useState<ViewType>('column');

  const [gmailProfile, setGmailProfile] = useState<{ user_account: string, profile_picture: string} | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Show Button when scrolled far too down.
  useEffect(() => {

    function handleScroll() {

      setShowButton(window.scrollY > 300);

    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

  // Show gmail profile picture 

  useEffect(() => {

    fetch('http://localhost:3000/gmail-profile')
    .then((res) => res.json())
    .then((data) => setGmailProfile(data))
    console.log('Profile:', gmailProfile)

  }, []);

  // Sync with gmail

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

  async function logout() {

    fetch('http://localhost:3000/logout')
    .then((res) => res.json())
    .then((data) => {

      console.log(data.message);
      setGmailProfile(null);      
      setApplications(data.applications);
                  
    })
    
  }

  async function getGmailIdAndRedirect(id: number) {
    
    console.log('getGmailIdAndRedirect called with id:', id);
    await fetch(`http://localhost:3000/gmailId/${id}`)
    .then((res) => res.json())
    .then((data) => {

      if (data.refresh_token && data.gmail_message_id !== null) {

        window.location.href = `https://mail.google.com/mail/u/0/#all/${data.gmail_message_id}`;

      } else {

        data.refresh_token? alert('No email found for this job application.') : alert('No gmail account is connected with job tracker.')

      }
            
    })


  }

  async function verifyRefreshToken(): Promise<boolean> {
    
   return fetch('http://localhost:3000/verify-refresh-token')
    .then((res) => res.json())
    .then((data) => !!data.refresh_token);

  }

  function connectGmail() {

    window.location.href = 'http://localhost:3000/auth/google';
    
  }

  // SHoe applications upon render

  useEffect(() => {

    fetch(`http://localhost:3000/applications`)
    .then((res) => res.json())
    .then((data) => setApplications(data))

  }, []);

  function isValidUrl(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

  function categorizeApps_column (status: string, searchTerm: string) {

    return (
      
      applications.filter((app) => app.status === status && app.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((filteredApp) => (
        
        <li key={filteredApp.id}>
                {editingId === filteredApp.id ? 
                
                <>

                  <div className='fixed z-20 w-2xl rounded-xl bg-slate-200 p-8 top-50 left-110'>

                    <div className='grid grid-cols-2 pb-2 mb-4 items-center border-b-2 border-indigo-500'>

                        <p className='col-start-1 text-2xl font-bold'>{filteredApp.role_title}</p>
                        <p className='col-start-1 text-2xl'>{filteredApp.company_name}</p>
                                    
                        <div className='ml-auto col-start-2 row-start-1 row-span-2 items-center'>
                        <input
                          className='mr-2 text-xl px-4 py-2 bg-white rounded-xl cursor-pointer' 
                          type="button" 
                          value="Cancel" 
                          onClick={() => {

                            setEditingId(null);

                            setEditingDraft(null);

                          }}
                        />

                        <input
                          className='text-xl text-white py-2 bg-indigo-500 rounded-xl px-4 cursor-pointer' 
                          type="button" 
                          value="Save" 
                          onClick={() => {

                            if (editingId !== null) {

                              saveEdit(editingId);
                              
                            }

                          }}
                        />
                        </div>
                    </div>  
                    
                    <div className='grid grid-cols-2'>
                      <div className='col-start-1'>
                      <label className='text-xs pb-2 mr-2 cursor-pointer' htmlFor="company_name">Company Name</label>
                      <input
                        type='text'
                        id='company_name'
                        className='flex mb-2 text-base rounded-xl p-2 border-2 border-slate-300 mr-2 w-full focus:border-indigo-500 focus:outline-none' 
                        value={editingDraft?. company_name ?? ''}
                        onChange={(event) => setEditingDraft({...editingDraft!, company_name : event.target.value})}  
                      />
                      </div>
                      
                      <div className='ml-4 col-start-2'>
                      <label className='text-xs pb-2 mr-2 cursor-pointer' htmlFor="role_title">Role Title</label>
                      <input
                        type='text'                    
                        className='flex mb-2 text-base rounded-xl p-2 border-2 border-slate-300 w-full focus:border-indigo-500 focus:outline-none'
                        id='role_title' 
                        value={editingDraft?. role_title ?? ''}
                        onChange={(event) => setEditingDraft({...editingDraft!, role_title : event.target.value})}  
                      />
                      </div>

                      <div className='col-start-1 col-span-2'>
                        <label htmlFor="link">Link</label>
                        <input
                        className='flex p-2 text-base border-2 border-slate-300 focus:outline-none focus:border-indigo-500 rounded-xl w-full' 
                        type="text"
                        id='link'
                        value={editingDraft?. link ?? ''}
                        onChange={(event) => setEditingDraft({...editingDraft!, link : event.target.value})}
                         />
                      </div>

                    </div>

                    <div className=''>
                      <label className='cursor-pointer' htmlFor="notes">Details</label>
                      <textarea 
                      onChange={(event) => setEditingDraft({...editingDraft!, notes : event.target.value})}   
                      id='notes' 
                      className='flex resize-none self-start w-full h-30 p-2 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500'>
                                                           
                        {editingDraft?. notes ?? ''}
                          
                      </textarea>
                    </div>

                  </div>
                
                  
                

                </>
                
                : 
                
                <>
                
                <div className={`grid grid-cols-3 rounded-xl p-2 mb-4 bg-white gap-2 w-64 transition-[opacity,visibility] duration-200`}>                    
                  <div className='col-start-1 col-span-2 pointer-events-none'>{filteredApp.company_name}</div>
                  <div className='col-start-3 row-start-1 row-end-[-1] pr-auto'><Info className='ml-auto rounded-xl bg-indigo-500 text-white cursor-pointer' onClick={() => {console.log('Info clicked, id:', filteredApp.id); setCheckingId(filteredApp.id);}}/></div>
                  <div className='col-start-1 col-span-2 text-lg font-bold pointer-events-none'>{filteredApp.role_title}</div>                                        
                  <div className='col-start-1 col-span-2 text-slate-500 text-xs pointer-events-none'>Applied {daysSinceApplied(filteredApp.applied_date)} days ago</div>
                  <div className='col-start-1 col-span-2 text-xs text-slate-500 items-center'>
                    <button className='mr-2 bg-slate-200 cursor-pointer p-2 z-10 rounded-xl hover:text-slate-700 transition-text duration-200' onClick={() => {
                      
                      const deleteConfirmed = confirm('Are you sure you want to delete the application? This cannot be undone.');
                      
                      if (deleteConfirmed) {

                        deleteApplication(filteredApp.id);

                      }

                      }}>Delete</button>

                    <button className='bg-slate-200 cursor-pointer p-2 z-10 rounded-xl hover:text-slate-700 transition-text duration-200' onClick={() => {

                      setEditingId(filteredApp.id);

                      setEditingDraft({...filteredApp});

                    }}>Edit</button>
                    
                  </div>

                  <select 
                  className='mr-auto col-start-3 text-sm text-slate-500 focus:outline-none w-full cursor-pointer hover:text-slate-700 transition-text duration-200'                   
                  value={filteredApp.status}
                    onChange={(event) => {

                      updateStatus(filteredApp.id, event.target.value);

                    }}>
                    <option value='applied'>applied</option>
                    <option value='interview'>interview</option>
                    <option value='offer'>offer</option>
                    <option value='rejected'>rejected</option>
                  </select>

                </div>

                <div className={`fixed z-20 w-2xl rounded-xl bg-slate-200 p-2 top-50 left-110 transition-[opacity,visibility] duration-300 ${checkingId === filteredApp.id? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                  <div className='flex'>                                        
                    <button className='ml-auto mr-2 text-slate-500 cursor-pointer hover:text-slate-700 transition-text duration-300' onClick={() => setCheckingId(null)}>✕</button>
                  </div>
                  <div className='flex mb-2 text-4xl items-center'>
                    <p className='mr-4 pointer-events-none'>{filteredApp.role_title}</p>
                    {status =='applied' 
                      && 
                    <Link className='mt-auto mb-1 text-slate-600 cursor-pointer transition-text duration-300 hover:text-indigo-500 group'
                    onClick={() => {

                      if (isValidUrl(filteredApp.link) === true) {

                        window.location.href = filteredApp.link

                      } else if (filteredApp.link === 'No link provided.') {

                        alert('No link provided.')

                      } else {
                        
                        alert('Not a valid link.')

                      }

                    }}
                    
                    />}
                    
                    {status !== 'applied' && <Mail onClick={() => getGmailIdAndRedirect(filteredApp.id)} className='mt-auto mb-1 text-slate-600 cursor-pointer transition-text duration-300 hover:text-indigo-500'/>} 
                  </div>
                  <div className='flex pb-2 items-center border-b-slate-400 border-b-2 mr-2'>
                    <p className='text-2xl pointer-events-none'>{filteredApp.company_name}</p>
                    <p className='ml-auto text-slate-500 pointer-events-none'>Status: {status}</p>
                  </div>
                  <div className='flex mt-2 mb-2 items-center'>
                    <ReceiptText className='text-indigo-500'/>
                    <p className='text-xl pointer-events-none'>Details</p>
                  </div>
                  <div className='flex p-2 indent-6 pointer-events-none'>
                    {filteredApp.notes}
                  </div>                              
                </div>

                </>
                
                }
                
        </li>

        


      ))

  )

  }

  function categorizeApps_list (status: string, searchTerm: string) {

    return (

      applications.filter((app) => app.status === status && app.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((filteredApp) => (

        <li key={filteredApp.id}>
          {editingId === filteredApp.id? 
          
            <div className='fixed z-20 w-2xl rounded-xl bg-slate-200 p-8 top-50 left-110'>

                    <div className='grid grid-cols-2 pb-2 mb-4 items-center border-b-2 border-indigo-500'>

                        <p className='col-start-1 text-2xl font-bold'>{filteredApp.role_title}</p>
                        <p className='col-start-1 text-2xl'>{filteredApp.company_name}</p>
                                    
                        <div className='ml-auto col-start-2 row-start-1 row-span-2 items-center'>
                        <input
                          className='mr-2 text-xl px-4 py-2 bg-white rounded-xl cursor-pointer' 
                          type="button" 
                          value="Cancel" 
                          onClick={() => {

                            setEditingId(null);

                            setEditingDraft(null);

                          }}
                        />

                        <input
                          className='text-xl text-white py-2 bg-indigo-500 rounded-xl px-4 cursor-pointer' 
                          type="button" 
                          value="Save" 
                          onClick={() => {

                            if (editingId !== null) {

                              saveEdit(editingId);
                              
                            }

                          }}
                        />
                        </div>
                    </div>  
                    
                    <div className='grid grid-cols-2'>
                      <div className='col-start-1'>
                      <label className='text-xs pb-2 mr-2 cursor-pointer' htmlFor="company_name">Company Name</label>
                      <input
                        type='text'
                        id='company_name'
                        className='flex mb-2 text-base rounded-xl p-2 border-2 border-slate-300 mr-2 w-full focus:border-indigo-500 focus:outline-none' 
                        value={editingDraft?. company_name ?? ''}
                        onChange={(event) => setEditingDraft({...editingDraft!, company_name : event.target.value})}  
                      />
                      </div>
                      
                      <div className='ml-4 col-start-2'>
                      <label className='text-xs pb-2 mr-2 cursor-pointer' htmlFor="role_title">Role Title</label>
                      <input
                        type='text'                    
                        className='flex mb-2 text-base rounded-xl p-2 border-2 border-slate-300 w-full focus:border-indigo-500 focus:outline-none'
                        id='role_title' 
                        value={editingDraft?. role_title ?? ''}
                        onChange={(event) => setEditingDraft({...editingDraft!, role_title : event.target.value})}  
                      />
                      </div>

                      <div className='col-start-1 col-span-2'>
                        <label htmlFor="link">Link</label>
                        <input
                        className='flex p-2 text-base border-2 border-slate-300 focus:outline-none focus:border-indigo-500 rounded-xl w-full' 
                        type="text"
                        id='link'
                        value={editingDraft?. link ?? ''}
                        onChange={(event) => setEditingDraft({...editingDraft!, link : event.target.value})}
                         />
                      </div>

                    </div>

                    <div className=''>
                      <label className='cursor-pointer' htmlFor="notes">Details</label>
                      <textarea 
                      onChange={(event) => setEditingDraft({...editingDraft!, notes : event.target.value})}   
                      id='notes' 
                      className='flex resize-none self-start w-full h-30 p-2 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500'>
                                                           
                        {editingDraft?. notes ?? ''}
                          
                      </textarea>
                    </div>

                  </div> 
            
            : 
            
            <>
              
              <div className='bg-white grid grid-cols-5 gap-4 items-center px-4 py-2 rounded-xl'>
              
                <div className='col-start-1'>
                  <p className='text-2xl truncate pointer-events-none'>{filteredApp.company_name}</p>
                </div>

                <div className='col-start-1'>
                  <p className='text-slate-500 pointer-events-none'>Applied {daysSinceApplied(filteredApp.applied_date)} days ago</p>
                </div>

                <div className='flex col-start-2 row-start-1 gap-x-2 items-center justify-center'>
                  {status !== 'applied' && <div className='relative self-center group'>
                    <Mail className='hover:text-indigo-500' onClick={() => getGmailIdAndRedirect(filteredApp.id)}/>
                    <div className='p-2 absolute -translate-y-1/2 bottom-1/2 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:text-white visible transition-opacity duration-200 pointer-events-none'>Email</div>
                  </div>}
                                    
                  {status === 'applied' && <div className='relative self-center group'>
                    <Link className='cursor-pointer hover:text-indigo-500' 
                    onClick={() => {

                      if (isValidUrl(filteredApp.link) === true) {

                        window.location.href = filteredApp.link

                      } else if (filteredApp.link === 'No link provided.') {

                        alert('No link provided.')

                      } else {
                        
                        alert('Not a valid link.')

                      }

                    }}
                    />
                    <div className='p-2 absolute -translate-y-1/2 bottom-1/2 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:text-white visible transition-opacity duration-200 pointer-events-none'>Link</div>
                  </div>}

                  <div className='relative self-center group'>
                    <ReceiptText className='cursor-pointer hover:text-indigo-500' onClick={() => setCheckingId(filteredApp.id)}/>
                    <div className='p-2 absolute -translate-y-1/2 bottom-1/2 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:text-white visible transition-opacity duration-200 pointer-events-none'>Details</div>
                  </div>

                </div>

                <div className={`fixed z-20 w-2xl rounded-xl bg-slate-200 p-2 top-50 left-110 transition-[opacity,visibility] duration-300 ${checkingId === filteredApp.id? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                  <div className='flex'>                                        
                    <button className='ml-auto mr-2 text-slate-500 cursor-pointer' onClick={() => setCheckingId(null)}>✕</button>
                  </div>
                  <div className='flex mb-2 text-4xl items-center'>
                    <p className='mr-4 pointer-events-none'>{filteredApp.role_title}</p>                                                            
                  </div>
                  <div className='flex pb-2 items-center border-b-slate-400 border-b-2 mr-2'>
                    <p className='text-2xl pointer-events-none'>{filteredApp.company_name}</p>
                    <p className='ml-auto text-slate-500 pointer-events-none'>Status: {status}</p>
                  </div>
                  <div className='flex mt-2 mb-2 items-center'>
                    <ReceiptText className='text-indigo-500'/>
                    <p className='text-xl pointer-events-none'>Details</p>
                  </div>
                  <div className='flex p-2 indent-6 pointer-events-none'>
                    {filteredApp.notes}
                  </div>                              
                </div>




                <div className='col-start-3 row-start-1 row-end-2 pointer-events-none'>
                  <p >{filteredApp.role_title}</p>              
                </div>
                
                <div className='col-start-4 row-start-1 row-end-2'>
                  <select className='focus:outline-none cursor-pointer hover:text-slate-700 transition-text duration-200' value={filteredApp.status} onChange={(event) => updateStatus(filteredApp.id, event.target.value)}>

                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </select>
                </div>

                <div className='flex col-start-5 row-start-1 row-end-2 items-center'>

                  <button className='ml-auto mr-2 bg-red-500 cursor-pointer p-2 z-10 rounded-xl hover:bg-red-600 transition-bg duration-300 hover:text-white transition-text duration-200' onClick={() => {
                      
                      const deleteConfirmed = confirm('Are you sure you want to delete the application? This cannot be undone.');
                      
                      if (deleteConfirmed) {

                        deleteApplication(filteredApp.id);

                      }

                      }}><Trash2/></button>

                    <button className='ml-4 bg-indigo-500 cursor-pointer p-2 z-10 rounded-xl hover:bg-indigo-600 transition-bg duration-300 hover:text-white transition-text duration-200' onClick={() => {

                      setEditingId(filteredApp.id);

                      setEditingDraft({...filteredApp});

                    }}><SquarePen/></button>

                </div>
                      
              </div>
              
            </>
          
          }

        </li>




      ))



    )



  }

  function resetForm () {

    setEditingDraft(null);
    setEditingId(null);
    setIsHidden(true);

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
        link : editingDraft?.link,
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
        <p className="text-3xl pointer-events-none">Job Application Tracker</p>                
        <div className='relative'>
        <Search className='absolute text-slate-500 left-3 top-1/2 -translate-y-1/2'/>
        <input type="text" onChange={(event) => setSearchTerm(event.target.value)} className='rounded-full shadow-lg p-2 pl-10 inline-lg outline-none text-slate-500' placeholder='Search by company name'/>        
        </div>
        {gmailProfile ? (
          <img 
            src={gmailProfile.profile_picture} 
            alt={gmailProfile.user_account}
            title={gmailProfile.user_account}
            className='w-10 h-10 rounded-full absolute flex items-center left-296'
          />
          ) 
          : 
          (
            <button className='absolute flex items-center left-300 cursor-pointer text-slate-700 p-2 rounded-full text-lg justify-center text-slate-500 border-none hover:text-indigo-500 transition-text duration-300' onClick={() => connectGmail()}>Connect gmail</button>
          )}

        {/* Side panel button */}
        <button className='cursor-pointer text-slate-700 hover:text-slate-500 transition-text duration-300' onClick={() => setIsOpen(true)}>
          <TextAlignJustify/>
        </button>        
      </div>
       
      {/* Add a new job button */}
      <button className='m-4 flex text-slate-500 cursor-pointer border-solid border rounded-full items-center outline-indigo-500 outline-2 p-2 hover:bg-indigo-600 transition-colors duration-300 hover:text-white transition-text duration-300' onClick={() => setIsHidden(false)}><Plus/> <p>New Job</p></button>

      {/* button for returning to top */}
      <button className={`fixed left-10 bottom-10 cursor-pointer rounded-xl text-white bg-indigo-500 p-2 transition-[opacity,visibility] duration-300 ${showButton? 'opacity-100 visible pointer-events-auto': 'opacity-0 invisible pointer-events-none'}`} onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth'})}><MoveUp/></button>

      {/* Overlay a blackened screen when add application window is open */}
      <div className={`fixed z-4 top-0 left-0 h-1000 w-1000 bg-black/75 transition-[opacity,visibility] duration-300 ${isHidden? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'}`}></div>

      {/* side panel */}
      <aside className={`fixed top-0 right-0 z-10 h-full w-10% bg-indigo-500 transition-transform duration-300 ease-out p-2 ${isOpen? 'translate-x-0' : 'translate-x-full'}`}>

        <div className='p-2 flex h-10 relative items-center text-xl justify-center text-slate-400'>
          <button className='relative cursor-pointer hover:text-slate-300 transition-colors duration-200' onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className='grid relative top-20 text-5xl text-white p-2 justify-center'>
          <div className='relative self-center group'>
            <button onClick={() => setView('column')} className='flex items-center cursor-pointer hover:bg-indigo-600 transition-colors duration-200  rounded-xl p-2'><Columns2/></button>
            <div className='p-2 absolute -translate-y-1/2 bottom-1/2 right-16 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>Column</div>
          </div>
          <div className='mt-10 relative self-center group'>
            <button onClick={() => setView('list')} className='flex items-center cursor-pointer hover:bg-indigo-600 transition-colors duration-200 rounded-xl p-2'><List/></button>
            <div className='p-2 absolute -translate-y-1/2 bottom-1/2 right-16 text-xs bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>List</div>
          </div>                    
        </div>

        <div className='m-2 p-2 relative grid top-106 group bg-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-400 transition-colors duration-300' onClick={() => sync()}>                    
            <div className='p-2 absolute text-xs bg-black text-white bottom-1/2 -translate-y-1/2 right-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none'>Sync</div>
            <button className={`text-white cursor-pointer ${isSyncing? 'animate-spin [animation-direction:reverse]':''}`}><RotateCcw/></button>          
        </div>

        
        <div 
        className='m-2 p-2 relative grid top-110 group bg-red-500 rounded-xl cursor-pointer hover:bg-red-600 transition-colors duration-300 hover:text-white transition-text duration-300' 
        onClick={async () => {

          const isConnected = await verifyRefreshToken();

          if (isConnected) {
  
            const userConfirmed = confirm('Are you sure you want to logout?'); 
            if (userConfirmed) {logout()};

          } else {

            alert('No gmail account is connected to job tracker.')

          }
                    
          }}>

          <div className='p-2 absolute text-xs bg-black text-white bottom-1/2 -translate-y-1/2 right-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none'>Logout</div>
          <button className='cursor-pointer'><LogOut/></button>

        </div>
        
      </aside>


      {/* 3 views with 4 categories */}

        {/* Column style */}
        {view == 'column' && <div className='grid grid-cols-4 ml-32 mr-24 gap-4'>

          <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2 pointer-events-none'>Applied</p><ul>{categorizeApps_column('applied', searchTerm)}</ul></div>
          <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2 pointer-events-none'>Interview</p><ul>{categorizeApps_column('interview', searchTerm)}</ul></div>
          <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2 pointer-events-none'>Rejected</p><ul>{categorizeApps_column('rejected', searchTerm)}</ul></div>
          <div className='h-full bg-slate-100 justify-items-center-safe rounded-xl pl-4 pr-4 pb-4'><p className='text-slate-500 mb-2 pointer-events-none'>Offered</p><ul>{categorizeApps_column('offer', searchTerm)}</ul></div>

        </div>}

        {/* list style */}
        {view == 'list' && <div className='grid gap-y-4'>
          
            <div className='p-4 ml-32 mr-24 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl'>
              <p className='flex text-3xl items-center text-indigo-500 pointer-events-none'>Applied <FileUser className='ml-2'/></p>              
              <ul className='grid grid-col-1 gap-y-4'>{categorizeApps_list('applied', searchTerm)}</ul>
            </div>

            <div className='p-4 ml-32 mr-24 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl'>
              <p className='flex text-3xl items-center text-indigo-500 pointer-events-none'>Interview <MessagesSquare className='ml-2'/></p>
              <ul className='grid grid-col-1 gap-y-4'>{categorizeApps_list('interview', searchTerm)}</ul>
            </div>

            <div className='p-4 ml-32 mr-24 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl'>
              <p className='flex text-3xl items-center text-indigo-500 pointer-events-none'>Rejected <UserRoundX className='ml-2'/></p>
              <ul className='grid grid-col-1 gap-y-4'>{categorizeApps_list('rejected', searchTerm)}</ul>
            </div>
          
            <div className='p-4 ml-32 mr-24 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl'>
              <p className='flex text-3xl items-center text-indigo-500 pointer-events-none'>Offered <MessageSquareCheck className='ml-2'/></p>
              <ul className='grid grid-col-1 gap-y-4'>{categorizeApps_list('offer', searchTerm)}</ul>
            </div>
          
        </div>}

      {/* new application */}
      <div className={`fixed z-20 w-6xl rounded-xl bg-slate-200 top-50 left-50 transition-[opacity,visibility] duration-300 ${isHidden? 'opacity-0 invisible pointer-events-none': 'opacity-100 visible pointer-events-auto'}`}>

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
                link,
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
              required
              autoComplete='off'
              type='text' 
              name='company_name' 
              id='company_name'
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              />
              <input className='rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none p-2'              
              required
              type='text' 
              name='role_title' 
              id='role_title'
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
              />

              <label className='mt-4 text-slate-500' htmlFor="link">Link</label>
              <input
              required
              autoComplete='off'
              className='col-span-2 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none p-2' 
              type="text" 
              id='link'
              value={link}
              onChange={(event) => setLink(event.target.value)}
              />

              <label className='col-span-2 mt-4 text-slate-500' htmlFor='notes'>Details(Optional)</label>
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
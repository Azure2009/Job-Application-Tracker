import { useState, useEffect } from 'react';
import { Undo2, LogOut, MessageSquareCheck, UserRoundX, SquarePen, Trash2, Mail, Link, ReceiptText, MoveUp, RotateCcw, Search, List, Plus, Columns2, TextAlignJustify, Info, FileUser, MessagesSquare} from 'lucide-react'


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

  const [isNewJobFormHidden, setisNewJobFormHidden] = useState<boolean>(true);

  const [isACardOpen, setIsACardOpen] = useState<boolean>(false);

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

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [focusOn, setFocusOn] = useState<string>('');
  
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

    fetch(`${import.meta.env.VITE_API_URL}/gmail-profile`)
    .then((res) => res.json())
    .then((data) => setGmailProfile(data))
    console.log('Profile:', gmailProfile)

  }, []);

  // Sync with gmail

  async function sync() {

  setIsSyncing(true);
  await fetch(`${import.meta.env.VITE_API_URL}/sync`)
  .then(() => fetch(`${import.meta.env.VITE_API_URL}/applications`))
  .then((res) => res.json())
  .then((apps) => {
    setApplications(apps);
    setIsSyncing(false);
  })

  }

  async function logout() {

    fetch(`${import.meta.env.VITE_API_URL}/logout`)
    .then((res) => res.json())
    .then((data) => {

      console.log(data.message);
      setGmailProfile(null);      
      setApplications(data.applications);
                  
    })
    
  }

  async function getGmailIdAndRedirect(id: number) {
    
    console.log('getGmailIdAndRedirect called with id:', id);
    await fetch(`${import.meta.env.VITE_API_URL}/gmailId/${id}`)
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
    
   return fetch(`${import.meta.env.VITE_API_URL}/verify-refresh-token`)
    .then((res) => res.json())
    .then((data) => !!data.refresh_token);

  }

  function connectGmail() {

    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    
  }

  // SHoe applications upon render

  useEffect(() => {

    fetch(`${import.meta.env.VITE_API_URL}/applications`)
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

  function layout_md() {

    // How the frontend will look like when screen size is equal or more than 768px

    return (

      <div className='max-md:hidden'>

        {view == 'column' && <div className='grid grid-cols-4 gap-4 mx-10'>
        
          <div className='flex flex-col items-center'>
            
            <div className='flex gap-2 px-2 py-[2.5px] rounded-xl'>
              <p className='font-bold text-slate-500'>Applied</p>
              <FileUser className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
            </div>
            <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-full mt-2 ${applications.filter((app)=> app.status === 'applied').length == 0? 'min-w-72 min-h-58' : ''}`}>
              { applications.filter((app)=> app.status === 'applied').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                  <p>No Job Application posted here</p>
                </div>}

              <ul>{categorizeApps_column('applied', searchTerm)}</ul>
            </div>
          </div>
          
          <div className='flex flex-col items-center'>
            
            <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
              <p className='font-bold text-slate-500'>Interview</p>
              <MessagesSquare className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
            </div>

            <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-full mt-2 ${applications.filter((app)=> app.status === 'interview').length == 0? 'min-w-72 min-h-58' : ''}`}>
              { applications.filter((app)=> app.status === 'interview').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                  <p>No Job Application posted here</p>
                </div>}

              <ul>{categorizeApps_column('interview', searchTerm)}</ul>
            </div>
          </div>
          
          <div className='flex flex-col items-center'>
            
            <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
              <p className='font-bold text-slate-500'>Rejected</p>
              <UserRoundX className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
            </div>

            <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-full mt-2 ${applications.filter((app)=> app.status === 'rejected').length == 0? 'min-w-72 min-h-58' : ''}`}>
              { applications.filter((app)=> app.status === 'rejected').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                  <p>No Job Application posted here</p>
                </div>}

              <ul>{categorizeApps_column('rejected', searchTerm)}</ul>
            </div>
          </div>
          
          <div className='flex flex-col items-center'>
            
            <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
              <p className='font-bold text-slate-500'>Offer</p>
              <MessageSquareCheck className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
            </div>

            <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-full mt-2 ${applications.filter((app)=> app.status === 'offer').length == 0? '' : ''}`}>
              { applications.filter((app)=> app.status === 'offer').length == 0 && <div className='text-slate-600 flex justify-center items-center'>
                  <p>No Job Application posted here</p>
                </div>}

              <ul>{categorizeApps_column('offer', searchTerm)}</ul>
            </div>
          </div>

        </div>}

      </div>


    )

  }

  function categorizeApps_column (status: string, searchTerm: string) {

    return (

      applications.filter((app) => app.status === status && app.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((filteredApp) => (
        
        <li key={filteredApp.id} className=''>
                {editingId === filteredApp.id ? 
                
                <>

                  <div className='fixed inset-0 z-10 w-64 h-114 md:justify-self-center rounded-xl mx-8 top-30 h-fit bg-slate-200 p-8'>

                    <div className='grid grid-cols-2 pb-2 mb-4 items-center border-b-2 border-indigo-500'>              
                      <div className='flex col-start-1 row-start-1 row-span-2 items-center'>
                        <input
                          className='mr-2 text-xl px-4 py-2 bg-white rounded-xl cursor-pointer' 
                          type="button" 
                          value="Cancel" 
                          onClick={() => {

                            document.body.style.overflow = '';
                            setEditingId(null);
                            setEditingDraft(null);
                            setIsACardOpen(false);

                          }}
                        />

                        <input
                          className='text-xl text-white py-2 bg-indigo-500 rounded-xl px-4 cursor-pointer' 
                          type="button" 
                          value="Save" 
                          onClick={() => {

                            if (editingId !== null) {

                              saveEdit(editingId);
                              setIsACardOpen(false);
                              
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
                
                  <div className={`grid grid-cols-3 rounded-xl p-2 mb-4 bg-white w-64 md:w-full transition-[opacity,visibility] duration-200`}>                    
                    <div title={filteredApp.company_name} className='col-start-1 col-span-2 cursor-default'>
                      <p className='truncate'>{filteredApp.company_name}</p>
                    </div>
                    <div className='col-start-3 row-start-1 row-end-[-1] pr-auto'><Info onClick={() => {setIsACardOpen(true); setCheckingId(filteredApp.id)}} className='ml-auto rounded-xl bg-indigo-500 text-white cursor-pointer' /></div>
                    <div className='col-start-1 col-span-2 text-lg font-bold cursor-default' title={filteredApp.role_title}>
                      <p className='truncate'>{filteredApp.role_title}</p>
                    </div>                                        
                    <div className='col-start-1 col-span-2 text-slate-500 text-xs pointer-events-none'>Applied {daysSinceApplied(filteredApp.applied_date)} days ago</div>
                    <div className='md:flex md:flex-col md:gap-2 col-start-1 col-span-2 text-xs my-2 text-slate-500 max-md:items-center'>
                      <button className='mr-2 bg-slate-200 md:w-fit cursor-pointer p-2 rounded-xl hover:text-slate-700 transition-text duration-200' onClick={() => {
                        
                        const deleteConfirmed = confirm('Are you sure you want to delete the application? This cannot be undone.');
                        
                        if (deleteConfirmed) {

                          deleteApplication(filteredApp.id);
                          setIsACardOpen(false);

                        }

                        }}>Delete</button>

                      <button className='bg-slate-200 cursor-pointer md:w-fit p-2 rounded-xl hover:text-slate-700 transition-text duration-200' onClick={() => {

                        document.body.style.overflow = 'hidden';
                        setEditingId(filteredApp.id);
                        setEditingDraft({...filteredApp});
                        setIsACardOpen(true);


                      }}>Edit</button>
                      
                    </div>

                    <select 
                    className='mr-auto col-start-3 md:col-start-1 md:col-span-2 text-sm text-slate-500 focus:outline-none w-full cursor-pointer hover:text-slate-700 transition-text duration-200'                   
                    value={filteredApp.status}
                      onChange={(event) => {

                        updateStatus(filteredApp.id, event.target.value);

                      }}>
                      <option value='applied'>applied</option>
                      <option value='interview'>interview</option>
                      <option value='rejected'>rejected</option>
                      <option value='offer'>offer</option>
                    </select>

                  </div>

                  {/* Extra info card */}
                  <div className={`fixed inset-0 left-0 justify-self-center self-center z-20 rounded-xl w-150 h-fit bg-slate-200 p-2 flex flex-col overflow-y-auto info-card-scroll transition-[opacity,visibility] duration-300 ${checkingId === filteredApp.id? 'shadow-xl/30 opacity-100 visible border-4 border-indigo-500 pointer-events-auto' : 'hidden'}`}>
                    <div className='flex'>                                        
                      <button className='ml-auto mr-2 text-slate-500 cursor-pointer hover:text-slate-700 transition-text duration-300' onClick={() => {setCheckingId(null); setIsACardOpen(false)}}>✕</button>
                    </div>
                    <div className='flex mb-2 items-center'>


                      <p className='relative truncate text-4xl mr-2' title={filteredApp.role_title}>{filteredApp.role_title}</p>
                       
                      <Link className={`mt-auto mb-1 ml-auto mr-10 w-30 text-slate-600 cursor-pointer transition-text duration-300 hover:text-indigo-500 group ${filteredApp.status === 'applied'? 'opacity-100 visible' : 'hidden'}`}
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
                      
                      <Mail onClick={() => getGmailIdAndRedirect(filteredApp.id)} className={`translate-y-[3px] text-slate-600 cursor-pointer opacity-0 invisible transition-text duration-300 hover:text-indigo-500 ${filteredApp.status !== 'applied'? 'opacity-100 visible' : ''}`}/> 

                    </div>
                    <div className='flex pb-2 items-center border-b-slate-400 border-b-2 mr-2 gap-4'>
                      <p className='text-2xl truncate' title={filteredApp.company_name}>{filteredApp.company_name}</p>
                      <p className='ml-auto translate-y-[2px] text-slate-500 pointer-events-none'>Status: {filteredApp.status}</p>
                    </div>
                    <div className='flex mt-2 mb-2 items-center'>
                      <ReceiptText className='text-indigo-500'/>
                      <p className='text-xl pointer-events-none'>Details</p>
                    </div>
                    <div className='flex-1  p-2 indent-6'>
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
          
            <div className='fixed inset-0 rounded-xl bg-slate-200 p-8 min-w-64 z-10 h-fit top-20 mx-4'>

                    <div className='grid grid-cols-2 pb-2 mb-4 items-center border-b-2 border-indigo-500 '>

                        <p title={filteredApp.role_title} className='cursor-default col-start-1 truncate font-bold'>{filteredApp.role_title}</p>
                        <p title={filteredApp.company_name} className='cursor-default col-start-1 truncate'>{filteredApp.company_name}</p>
                                    
                        <div className='flex flex-col gap-2 col-start-2 row-start-1 row-span-2 items-center'>
                          <input
                            className=' text-md px-4 w-fit py-2 bg-white rounded-xl translate-x-[1px] cursor-pointer' 
                            type="button" 
                            value="Cancel" 
                            onClick={() => {

                              document.body.style.overflow = '';
                              setEditingId(null);
                              setEditingDraft(null);
                              setIsACardOpen(false);
                              

                            }}
                          />

                          <input
                            className='text-md text-white py-2 bg-indigo-500 rounded-xl px-4 w-fit cursor-pointer' 
                            type="button" 
                            value="Save" 
                            onClick={() => {

                              if (editingId !== null) {

                                saveEdit(editingId);
                                setIsACardOpen(false);
                                
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
              
              <div className='bg-slate-300 grid grid-cols-6 w-66 items-center px-2 py-2 rounded-xl'>
              
                <div title={filteredApp.company_name} className='col-start-1 col-span-3'>
                  <p className='text-slate-700 truncate pointer-events-none'>{filteredApp.company_name}</p>
                </div>

                {/* Extra details info card */}
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

                {/* <div className='col-start-1 row-start-2 row-end-2 pointer-events-none truncate text-ellipsis'>
                  <p >{filteredApp.role_title}</p>              
                </div> */}
                
                <div className='col-start-4 col-span-5 row-start-1'>
                  <select className='text-xs focus:outline-none cursor-pointer text-slate-700 hover:text-slate-900 transition-text duration-200' value={filteredApp.status} onChange={(event) => updateStatus(filteredApp.id, event.target.value)}>

                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                  </select>
                </div>

                <div className='flex col-start-6 row-start-1 items-center justify-evenly'>

                  <Trash2 onClick={() => {
                      
                      const deleteConfirmed = confirm('Are you sure you want to delete the application? This cannot be undone.');
                      
                      if (deleteConfirmed) {

                        deleteApplication(filteredApp.id);

                      }

                      }} className='text-slate-700 w-4 h-4 cursor-pointer hover:text-slate-900 transition-bg duration-200'/>

                  <SquarePen onClick={() => {

                    document.body.style.overflow = 'hidden';
                    setEditingId(filteredApp.id);
                    setEditingDraft({...filteredApp});
                    setIsACardOpen(true);

                  }} className='text-slate-700 w-4 h-4 cursor-pointer hover:text-slate-900 transition-bg duration-200'/>

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
    setisNewJobFormHidden(true);

  }

  async function deleteApplication (id: number) {

  fetch(`${import.meta.env.VITE_API_URL}/applications/${id}`, 
    {
      method: 'DELETE'

  })
  .then(() => setApplications((prev) => prev.filter((app) => app.id !== id)))
  
}

  async function updateStatus (id: number, status: string) {

  fetch(`${import.meta.env.VITE_API_URL}/applications/${id}`, 
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

    fetch(`${import.meta.env.VITE_API_URL}/applications/${id}`, {

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
      <div className='flex max-md:flex-col gap-4 relative items-center justify-between p-4 mb-10'>
        <div className='flex flex-col items-center'>
          <p className="text-3xl font-extrabold text-indigo-500 pointer-events-none">Search Sync</p>               
          <p className='relative text-slate-500 pointer-events-none'>Sync Better, Track Smarter</p>
        </div>
        {gmailProfile ? (
          <img 
            src={gmailProfile.profile_picture} 
            alt={gmailProfile.user_account}
            title={gmailProfile.user_account}
            className='w-10 h-10 rounded-full absolute flex items-center left-2 top-4'
          />
          ) 
          : 
          (
            <div className='flex md:order-3 gap-x-2 p-2 items-center cursor-pointer rounded-xl bg-slate-500 hover:bg-slate-600 transition-bg duration-300' onClick={() => connectGmail()}>
              <p className='text-slate-200'>Connect gmail</p>
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
              className=' w-10 h-10 bg-slate-400 rounded-xl p-[4px] fill-slate-200'>
                <title>Gmail</title>
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            </div>
          )
        }

        <div className='relative'>        
          <Search className='absolute text-slate-500 left-3 top-1/2 -translate-y-1/2'/>
          <input type="text" onChange={(event) => setSearchTerm(event.target.value)} className='rounded-full shadow-3xl p-2 pl-10 inline-fit outline-none text-slate-500' placeholder='Search by company name'/>        
        </div>
        
        {/* Side panel button */}
        
        <TextAlignJustify className='max-md:absolute md:order-4 md:w-8 md:h-8 right-0 md:-translate-y-[1.5px] -translate-x-2 translate-y-2 cursor-pointer text-slate-700 hover:text-slate-500 transition-text duration-300' onClick={() => setIsOpen(true)}/>
        
      </div>
      {/* Add a new job button */}
      <div className='fixed z-4 left-4 bottom-4'>
        <div className='relative flex items-center group'>
          <Plus onClick={() => {setIsACardOpen(true); setisNewJobFormHidden(false); document.body.style.overflow = 'hidden';}} className={`md:w-13 md:h-13 w-8 h-8 text-slate-500 cursor-pointer border-solid border rounded-full items-center outline-indigo-500 outline-2 md:w-12 md:h-12 ${isNewJobFormHidden? 'hover:bg-indigo-600 transition-colors duration-300 hover:text-white transition-text duration-300' : ''}`}/>
          <div className={`absolute opacity-0 invisible pointer-events-none text-xs translate-x-8 md:text-base ml-2 bg-indigo-500 text-white text-nowrap px-[1.5px] md:px-[3px] md:translate-x-14 font-semibold ${isNewJobFormHidden? 'group-hover:opacity-100 visible transition-all duration-300' : ''}`}>Add job application</div>
        </div>
      </div>

      {/* button for returning to top */}
      <div className={`fixed z-4 left-[16px] md:left-[18px] md:bottom-20 bottom-16 transition-[opacity,visibility] duration-300 ${showButton? 'opacity-100 visible pointer-events-auto': 'opacity-0 invisible pointer-events-none'}`}>  
        <div className='relative flex items-center group'>
          <button className={`cursor-pointer rounded-xl md:w-12 md:h-12 w-8 h-8 flex justify-center items-center text-indigo-500 border-solid border outline-indigo-500 outline-2 p-2 hover:bg-indigo-500 hover:text-white transition-all duration-300`} onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth'})}><MoveUp className='md:scale-150 scale-140'/></button>
          <div className='absolute opacity-0 invisible text-nowrap md:translate-x-14.5 md:text-base translate-x-10 text-xs pointer-events-none font-medium bg-indigo-500 text-white px-[1.5px] group-hover:opacity-100 visible transition-all duration-300'>Return to top</div>
        </div>
      </div>  

      {/* side panel */}
      <aside className={`fixed top-0 right-0 z-40 h-full w-8 md:w-15 bg-indigo-500 transition-transform duration-300 ease-out p-2 ${isOpen? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className='p-2 flex mt-2 mb-10 h-10 relative items-center text-xl justify-center text-slate-400'>
          <button className='relative cursor-pointer md:scale-124 md:translate-y-2 hover:text-slate-300 transition-colors duration-200' onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className='flex flex-col text-white gap-4 md:gap-8 md:mt-20 justify-center'>
          <div className='relative self-center group'>
            <button onClick={() => setView('column')} className='flex items-center cursor-pointer md:p-2 hover:bg-indigo-600 transition-colors duration-200 rounded-xl'><Columns2 className='scale-80 md:scale-120'/></button>
            <div className='px-[1.5px] absolute -translate-y-5 md:-translate-y-[32px] md:-translate-x-[74px] -translate-x-[50px] text-xs md:text-base bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>Column</div>
          </div>
          <div className='relative self-center group'>
            <button onClick={() => setView('list')} className='flex items-center cursor-pointer md:p-[6px] hover:bg-indigo-600 transition-colors duration-200 rounded-xl'><List className='scale-80 md:scale-110'/></button>
            <div className='px-[1.5px] absolute -translate-y-5 md:-translate-y-[30px] md:-translate-x-[45px] -translate-x-[27px] text-xs md:text-base bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none'>List</div>
          </div>                    
        </div>

        <div className='absolute bottom-4 right-[2px] md:-translate-x-[8px] flex flex-col gap-2 md:gap-6'>
          
          <div className='relative flex group bg-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-400 transition-colors duration-300' onClick={() => sync()}>                    
            <div className='px-[2px] absolute -translate-x-8.5 md:-translate-x-[52px] md:translate-y-[8px] translate-y-[4px] text-xs md:text-base bg-black text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none'>Sync</div>
            <button className={`p-[1.5px] md:p-2 text-white cursor-pointer ${isSyncing? 'animate-spin [animation-direction:reverse]':''}`}><RotateCcw className='scale-80 md:scale-120'/></button>          
          </div>
          
          <div 
          className='flex justify-center group bg-red-500 rounded-xl cursor-pointer hover:bg-red-600 transition-colors duration-300 hover:text-white transition-text duration-300' 
          onClick={async () => {

            const isConnected = await verifyRefreshToken();

            if (isConnected) {
    
              const userConfirmed = confirm('Are you sure you want to logout?'); 
              if (userConfirmed) {logout()};

            } else {

              alert('No gmail account is connected to job tracker.')

            }
                      
            }}>

            <div className='p-[1.5px] -translate-x-10 md:-translate-x-[63px] md:translate-y-[4px] translate-y-[1px] absolute text-xs md:text-base bg-black text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none'>Logout</div>
            <button className='md:p-2 cursor-pointer'><LogOut className='scale-80 md:scale-120'/></button>

          </div>
        </div>
        
      </aside>
      
      
      {/* Icons for the 4 categories */}
      
      <div className={`flex justify-center min-md:hidden max-md:justify-evenly md:gap-36 ${(focusOn || view !== 'column')? 'hidden' : ''}`}>
        
        {/* <p className={`self-center font-semibold text-slate-500 ${focusOn !== 'applied'? 'hidden' : ''}`}>Applied</p> */}
        <div 
        onClick={() => {

          setFocusOn('applied');
        
        }} 
        id='applied' className={`relative group rounded-xl text-slate-500 bg-slate-100 p-[5px] cursor-pointer hover:bg-slate-200 transition-bg duration-200`}
        >
          <div className={`absolute opacity-0 -translate-y-6 md:-translate-y-8 md:-translate-x-[20px] -translate-x-[12px] invisible px-[3px] bg-slate-200 text-xs md:text-base text-slate-500 rounded-xl font-bold group-hover:visible opacity-100 transition-all duration-200`}>Applied</div>
          <FileUser className='grid justify-self-center'/>
        </div>
        

        
        {/* <p className={`self-center font-semibold text-slate-500 ${focusOn !== 'interview'? 'hidden' : ''}`}>Interview</p> */}
        <div 
        onClick={() => {

          setFocusOn('interview');
          
        }} 
        id='interview' className={`relative group rounded-xl text-slate-500 bg-slate-100 p-[5px] cursor-pointer hover:bg-slate-200 transition-bg duration-200`}
        >
          <div className={`absolute opacity-0 -translate-y-6 md:-translate-y-8 md:-translate-x-6.5 -translate-x-4 invisible px-[1.5px] px-[3px] bg-slate-200 text-xs md:text-base text-slate-500 rounded-xl font-bold group-hover:visible opacity-100 transition-all duration-200`}>Interview</div>
          <MessagesSquare className='grid justify-self-center'/>
        </div>
        

        
        {/* <p className={`self-center font-semibold text-slate-500 ${focusOn !== 'rejected'? 'hidden' : ''}`}>Rejected</p> */}
        <div 
        onClick={() => {
          
          setFocusOn('rejected');
          
        }} 
        id='rejected' className={`relative group rounded-xl text-slate-500 bg-slate-100 p-[5px] cursor-pointer hover:bg-slate-200 transition-bg duration-200`}
        >
          <div className={`absolute opacity-0 -translate-y-6 md:-translate-y-8 md:-translate-x-5.5 -translate-x-3.5 invisible px-[1.5px] px-[3px] bg-slate-200 text-xs md:text-base text-slate-500 rounded-xl font-bold group-hover:visible opacity-100 transition-all duration-200`}>Rejected</div>
          <UserRoundX className='grid justify-self-center'/>
        </div>
        

        
        {/* <p className={`self-center font-semibold text-slate-500 ${focusOn !== 'offer'? 'hidden' : ''}`}>Offer</p> */}
        <div 
        onClick={() => {

          setFocusOn('offer');
          

        }} 
        id='offer' className={`relative group rounded-xl text-slate-500 bg-slate-100 p-[5px] cursor-pointer hover:bg-slate-200 transition-bg duration-200`}
        >
          <div className={`absolute opacity-0 -translate-y-6 md:-translate-y-8 md:-translate-x-[9.5px] -translate-x-[4.5px] invisible px-[1.5px] px-[3px] bg-slate-200 text-xs md:text-base text-slate-500 rounded-xl font-bold group-hover:visible opacity-100 transition-all duration-200`}>Offer</div>
          <MessageSquareCheck className='grid justify-self-center'/>
        
        </div>

      </div>
      
      {/* 2 views with 4 categories. Strictly NOT shown for tablet screen size and larger */}

      {/* Column style */}
      {view == 'column' && focusOn && <div className='flex flex-col items-center min-md:hidden'>
        
        <div className='relative w-fit group'>
          <div className='absolute -translate-y-6 -translate-x-4 opacity-0 invisible bg-black text-white text-xs px-[1.5px] border-[2px] border-slate-500 group-hover:opacity-100 visible transition-all duration-200'>back</div>
          <Undo2 onClick={()=> {setFocusOn(''); setEditingId(null); setCheckingId(null); document.body.style.overflow = '';}} className={`text-slate-500 cursor-pointer`}/>
        </div>

        { focusOn === 'applied' && <div className='flex flex-col flex-1'>
          
          <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
            <p className='font-bold text-slate-500'>Applied</p>
            <FileUser className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
          </div>
          <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-fit mt-2 ${applications.filter((app)=> app.status === 'applied').length == 0? 'min-w-72 min-h-58' : ''}`}>
            { applications.filter((app)=> app.status === 'applied').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                <p>No Job Application posted here</p>
              </div>}

            <ul>{categorizeApps_column('applied', searchTerm)}</ul>
          </div>
        </div>}
        
        {focusOn === 'interview' && <div className={`flex flex-col`}>
          
          <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
            <p className='font-bold text-slate-500'>Interview</p>
            <MessagesSquare className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
          </div>

          <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-fit mt-2 ${applications.filter((app)=> app.status === 'interview').length == 0? 'min-w-72 min-h-58' : ''}`}>
            { applications.filter((app)=> app.status === 'interview').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                <p>No Job Application posted here</p>
              </div>}

            <ul>{categorizeApps_column('interview', searchTerm)}</ul>
          </div>
        </div>}
        
        {focusOn === 'rejected' && <div className={`flex flex-col`}>
          
          <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
            <p className='font-bold text-slate-500'>Rejected</p>
            <UserRoundX className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
          </div>

          <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-fit mt-2 ${applications.filter((app)=> app.status === 'rejected').length == 0? 'min-w-72 min-h-58' : ''}`}>
            { applications.filter((app)=> app.status === 'rejected').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                <p>No Job Application posted here</p>
              </div>}

            <ul>{categorizeApps_column('rejected', searchTerm)}</ul>
          </div>
        </div>}
        
        {focusOn === 'offer' && <div className={`flex flex-col`}>
          
          <div className='flex gap-2 px-2 py-[2.5px] w-fit rounded-xl'>
            <p className='font-bold text-slate-500'>Offer</p>
            <MessageSquareCheck className='text-slate-500 bg-slate-100 px-[4px] rounded-xl'/>
          </div>

          <div className={`relative bg-slate-300 rounded-xl p-2 flex flex-col w-fit mt-2 ${applications.filter((app)=> app.status === 'offer').length == 0? 'min-w-72 min-h-58' : ''}`}>
            { applications.filter((app)=> app.status === 'offer').length == 0 && <div className='text-slate-600 flex flex-1 justify-center items-center'>
                <p>No Job Application posted here</p>
              </div>}

            <ul>{categorizeApps_column('offer', searchTerm)}</ul>
          </div>
        </div>}

      </div>}

      {/* list style */}
      {view == 'list' && <div className='grid gap-y-4 px-2 justify-items-center'>
        
        <div className='p-4 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl w-fit'>
          <p className='flex items-center text-indigo-500 pointer-events-none'>Applied <FileUser className='ml-2'/></p>
          { applications.filter((app) => app.status === 'applied').length == 0 && <p className='text-slate-600 mx-5'>No Job Application posted here</p>}
          <ul className='grid grid-col-1 gap-y-4 w-fit'>{categorizeApps_list('applied', searchTerm)}</ul>
        </div>

        <div className='p-4 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl w-fit'>
          <p className='flex items-center text-indigo-500 pointer-events-none'>Interview <MessagesSquare className='ml-2'/></p>
          <ul className='grid grid-col-1 gap-y-4 w-fit'>{categorizeApps_list('interview', searchTerm)}</ul>
          { applications.filter((app) => app.status === 'interview').length == 0 && <p className='text-slate-600 mx-5'>No Job Application posted here</p>}
        </div>

        <div className='p-4 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl w-fit'>
          <p className='flex items-center text-indigo-500 pointer-events-none'>Rejected <UserRoundX className='ml-2'/></p>
          <ul className='grid grid-col-1 gap-y-4 w-fit'>{categorizeApps_list('rejected', searchTerm)}</ul>
          { applications.filter((app) => app.status === 'rejected').length == 0 && <p className='text-slate-600 mx-5'>No Job Application posted here</p>}
        </div>
      
        <div className='p-4 grid grid-col-1 gap-y-4 bg-slate-100 rounded-xl w-fit'>
          <p className='flex items-center text-indigo-500 pointer-events-none'>Offered <MessageSquareCheck className='ml-2'/></p>
          <ul className='grid grid-col-1 gap-y-4 w-fit'>{categorizeApps_list('offer', searchTerm)}</ul>
          { applications.filter((app) => app.status === 'offer').length == 0 && <p className='text-slate-600 mx-5'>No Job Application posted here</p>}
        </div>
          
      </div>}

      {layout_md()}
      
      {/* Overlay a blackened screen when add application window is open */}
      <div
      onClick={() => {setIsACardOpen(false); setisNewJobFormHidden(true); setIsACardOpen(false); setEditingId(null); setEditingDraft(null); setCheckingId(null); document.body.style.overflow = '';}}  
      className={`fixed top-0 left-0 z-5 w-screen h-screen  bg-black/75 transition-[opacity,visibility] duration-300 ${isACardOpen? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}></div>

      {/* Overlay a black screen when sidePanel is open */}
      <div
      onClick={() => {setIsOpen(false); document.body.style.overflow = '';}} 
      className={`fixed z-30 top-0 left-0 w-screen h-screen  bg-black/75 transition-[opacity,visibility] duration-300 ${isOpen? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
      ></div>

      {/* new application */}
      <div className={`fixed md:inset-0 md:w-fit md:h-fit self-center justify-self-center z-20 max-md:top-40 mx-2 rounded-xl bg-slate-200 transition-[opacity,visibility] duration-300 ${isNewJobFormHidden? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'}`}>

        <form className='grid grid-cols-2 p-4 gap-x-4' onSubmit={ async (event) => {

          event.preventDefault();

          fetch(`${import.meta.env.VITE_API_URL}/applications`, {
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
                document.body.style.overflow = '';
                resetForm();
                setIsACardOpen(false);

            }}}/>

            <input className='border rounded-full p-2 bg-indigo-500 text-white col-span-2 cursor-pointer' type='submit' value='Submit'/>
          
        </form>          

      </div>      
    </>
  )
}

export default App
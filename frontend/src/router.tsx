import {useState} from 'react'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { X, PanelLeft } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function Router() {

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (

        <div>

            <PanelLeft onMouseEnter={() => setIsPanelOpen(true)} className='absolute left-2 top-2 text-indigo-500 3xl:w-6 3xl:h-6 5xl:w-10 5xl:h-10'/>

            <div className={`z-10 fixed h-screen w-screen bg-black/70 transition-all duration-200 ${isPanelOpen? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

            <BrowserRouter>

                <div onMouseLeave={() => setIsPanelOpen(false)} className={`z-20 fixed left-0 top-0 w-30 5xl:w-50 h-screen bg-indigo-500 transition-all duration-300 ${isPanelOpen? 'translate-x-0' : '-translate-x-full'}`}>
                    <nav className='p-2'>
                        
                        <X onClick={() => setIsPanelOpen(false)} className='ml-auto cursor-pointer text-slate-500 5xl:w-8 5xl:h-8'/>

                        <div className='flex flex-col text-slate-300 5xl:text-2xl font-semibold gap-2 5xl:gap-3'>
                            <Link to='/' className='w-fit transition-text duration-200 hover:text-indigo-600'>Home</Link>
                            <Link to='/login' className='w-fit transition-text duration-200 hover:text-indigo-600'>Sign in</Link>
                            <Link to='/register' className='w-fit transition-text duration-200 hover:text-indigo-600'>Get started</Link>
                        </div>

                    </nav>
                </div>
            
                <Routes>
                    <Route path='/' element={<LandingPage />}/>
                    <Route path='/register' element={<RegisterPage />}/>
                    <Route path='/login' element={<LoginPage />}/>
                </Routes>  
            </BrowserRouter>

        </div>

    );

}

export default Router


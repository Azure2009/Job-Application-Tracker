import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

import LandingPage from './pages/landingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function Index() {

    return (

        <BrowserRouter>

            <div className='fixed left-0 top-0 h-screen bg-indigo-500'>
                <nav className='flex flex-col text-center p-2'>
                    
                    <Link to='/introduction'>Home</Link>
                    <Link to='/register'>Get started</Link>
                    <Link to='/login'>Log in</Link>
                    
                </nav>
            </div>
        
            <Routes>
                <Route path='/introduction' element={<LandingPage />}/>
                <Route path='/register' element={<RegisterPage />}/>
                <Route path='/login' element={<LoginPage />}/>
            </Routes>  
        </BrowserRouter>

    );

}

export default Index


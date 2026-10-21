import { useState } from 'react';
import { BrowserRouter, Route, Routes, Link, Outlet, useNavigate } from 'react-router-dom';
import { X, PanelLeft } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import App from './App';
import { useAuth } from './auth/AuthContext';
import { PublicOnlyRoute, ProtectedRoute } from './auth/RouteGuards';

function PublicLayout() {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <div>
            <PanelLeft
                onMouseEnter={() => setIsPanelOpen(true)}
                className='absolute left-2 top-2 text-indigo-500 3xl:w-6 3xl:h-6 5xl:w-10 5xl:h-10'
            />

            <div className={`z-10 fixed h-screen w-screen bg-black/70 transition-all duration-200 ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

            <div
                onMouseLeave={() => setIsPanelOpen(false)}
                className={`z-20 fixed left-0 top-0 w-30 5xl:w-50 h-screen bg-indigo-500 transition-all duration-300 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <nav className='p-2'>
                    <X onClick={() => setIsPanelOpen(false)} className='ml-auto cursor-pointer text-slate-500 5xl:w-8 5xl:h-8' />
                    <NavLinks />
                </nav>
            </div>

            <Outlet />
        </div>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Pages with the left sidebar */}
                <Route element={<PublicLayout />}>
                    <Route path='/' element={<LandingPage />} />

                    <Route element={<PublicOnlyRoute />}>
                        <Route path='/register' element={<RegisterPage />} />
                        <Route path='/login' element={<LoginPage />} />
                    </Route>
                </Route>

                {/* Authenticated pages, no left sidebar */}
                <Route element={<ProtectedRoute />}>
                    <Route path='/dashboard' element={<App />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

function NavLinks() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const linkClass = 'w-fit transition-text duration-200 hover:text-indigo-600';

    return (
        <div className='flex flex-col text-slate-300 5xl:text-2xl font-semibold gap-2 5xl:gap-3'>
            <Link to='/' className={linkClass}>Home</Link>

            {user ? (
                <>
                    <Link to='/dashboard' className={linkClass}>Dashboard</Link>
                    <button
                        className={`${linkClass} cursor-pointer text-left`}
                        onClick={async () => {
                            await logout();
                            navigate('/');
                        }}
                    >
                        Log out
                    </button>
                </>
            ) : (
                <>
                    <Link to='/login' className={linkClass}>Sign in</Link>
                    <Link to='/register' className={linkClass}>Get started</Link>
                </>
            )}
            
        </div>

    );
}

export default Router


import {useState} from 'react'

function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [statusMessage, setStatusMessage] = useState('')

    return (

        <div className="flex justify-center items-center p-4 min-h-screen bg-slate-200">

            <div className="-translate-y-20 5xl:-translate-y-50">

                <p className="justify-self-center text-indigo-500 font-extrabold text-3xl mb-10 5xl:text-5xl">SearchSync</p>

                <div className="flex flex-col w-70 md:w-110 lg:w-120 5xl:w-200 5xl:text-2xl bg-white rounded-xl p-2">
                    
                    <div className="flex flex-col gap-[2px]">
                        <p className="text-2xl 5xl:text-4xl font-bold">Sign in</p>
                        <div className="flex w-full">
                            <div className="flex flex-1 h-[2px] 5xl:mt-2 bg-indigo-500"></div>
                        </div>

                        <form className="flex flex-col gap-2" onSubmit={async (event) => {

                            event.preventDefault();
                            setStatusMessage('');

                            try {
                               
                                const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {

                                    method: 'POST',
                                    headers: {

                                        'Content-Type': 'application/json'

                                    },

                                    body: JSON.stringify({

                                        email,
                                        password

                                    })


                                });

                                const data = await response.json();

                                if (!response.ok) {

                                    setStatusMessage(data.message ?? 'Login failed.');
                                    
                                    return;

                                };

                                setStatusMessage(data.message);

                            } catch {
                            
                                setStatusMessage('Something went wrong. Please try again.');

                            }

                        }}>

                            <div>
                                <label htmlFor="email">email</label>
                                <input id='email' name="email" type="email" placeholder="enter email" value={email} onChange={(event) => {setEmail(event.target.value)}} autoComplete="off" required className="px-2 py-[2px] w-full rounded-md border-2 border-slate-500 outline-none focus:border-2 focus:border-indigo-800"/>
                            </div>

                            <div>
                                <label htmlFor="password">password</label>
                                <input id='password' name="password" type="password" placeholder="enter password" value={password} onChange={(event) => {setPassword(event.target.value)}} autoComplete="off" required className="px-2 py-[2px] w-full rounded-md border-2 border-slate-500 outline-none focus:border-2 focus:border-indigo-800"/>
                            </div>

                            <button type="submit" 
                            className="relative isolate overflow-hidden cursor-pointer rounded-full text-white font-semibold p-2 w-full bg-linear-to-r from-indigo-500 to-indigo-800 
                            before:inset-0 before:content-[''] before:opacity-0 before:-z-10 before:absolute before:bg-linear-to-b before:from-indigo-800 before:to-sky-400 before:transition-opacity before:duration-500 hover:before:opacity-100"
                            >
                                Submit
                            </button>

                        </form>

                        <p role='status' className='text-red-500'>{statusMessage}</p>

                    </div>

                </div>

            </div>

        </div>

    )


}

export default LoginPage
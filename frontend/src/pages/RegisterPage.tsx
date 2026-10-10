function RegisterPage() {

    return (

        <div className="flex flex-col justify-center items-center p-4 min-h-screen bg-slate-200">

            <div className="-translate-y-20 5xl:-translate-y-50">

                <p className="justify-self-center text-indigo-500 font-extrabold text-3xl mb-10 5xl:text-5xl">SearchSync</p>

                <div className="flex flex-col w-70 md:w-110 lg:w-120 5xl:w-200 5xl:text-2xl bg-white rounded-xl p-2">
                    
                    <div className="flex flex-col gap-[2px]">
                        <p className="text-2xl 5xl:text-4xl font-bold">Register</p>
                        <div className="flex w-full">
                            <div className="flex flex-1 h-[2px] 5xl:mt-2 bg-indigo-500"></div>
                        </div>

                        <form action="" className="flex flex-col gap-2">
                            <div>
                                <label htmlFor="fullName">full name</label>
                                <input id="fullName" type="text" placeholder="enter full name" autoComplete="off" required className="px-2 py-[2px] w-full rounded-md border-2 border-slate-500 outline-none focus:border-2 focus:border-indigo-800"/>
                            </div>

                            <div>
                                <label htmlFor="email">email</label>
                                <input id="email" type="text" placeholder="enter email" autoComplete="off" required className="px-2 py-[2px] w-full rounded-md border-2 border-slate-500 outline-none focus:border-2 focus:border-indigo-800"/>
                            </div>

                            <div>
                                <label htmlFor="password">password</label>
                                <input id="password" type="password" placeholder="enter password" autoComplete="off" required className="px-2 py-[2px] w-full rounded-md border-2 border-slate-500 outline-none focus:border-2 focus:border-indigo-800"/>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword">confirm password</label>
                                <input id="confirmPassword" type="password" placeholder="retype password" autoComplete="off" required className="px-2 py-[2px] w-full rounded-md border-2 border-slate-500 outline-none focus:border-2 focus:border-indigo-800"/>
                            </div>

                            <button type="submit" 
                            className="relative isolate overflow-hidden cursor-pointer rounded-full text-white font-semibold p-2 w-full bg-linear-to-r from-indigo-500 to-indigo-800 
                            before:inset-0 before:content-[''] before:opacity-0 before:-z-10 before:absolute before:bg-linear-to-b before:from-indigo-800 before:to-sky-400 before:transition-opacity before:duration-500 hover:before:opacity-100"
                            >
                                Submit
                            </button>

                        </form>

                    </div>

                </div>

            </div>
        </div>

    )


}

export default RegisterPage
function LandingPage() {

    return (
    
        <div className="min-h-screen p-2">
            <p className="-translate-y-2 justify-self-center text-indigo-500 font-extrabold text-3xl mb-10 5xl:text-5xl">SearchSync</p>

            <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 bg-linear-to-br from-black to-indigo-700 text-white rounded-lg p-2">
                    <p className="text-justify font-light">Connect your gmail to searchsync, <span className="font-semibold">no more manual checking for job updates.</span></p>

                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                    className="justify-self-center self-center w-10 h-10 fill-[#EA4335]">
                    <title>Gmail</title>
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>

                    <p className="text-justify col-span-2"></p>

                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="text-xl">One button, filters all</p>
                    <div className="border">
                        Insert sample video 
                    </div>
                </div>

                <div className="flex flex-col">
                    <p className="">Easy status change</p>
                    <div className="self-center border">
                        Insert sample video

                    </div>
                </div>

            </div>

        </div>

    )


}

export default LandingPage
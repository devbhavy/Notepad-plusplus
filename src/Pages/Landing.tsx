import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";
import { ComicText } from "@/components/ui/comic-text";
import googleIcon from "../assets/google.png"
import logo from "../assets/Gemini_Generated_Image_wxyh3ewxyh3ewxyh-removebg-preview.png"


export function Landing() {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const [backendRunning, setBackendRunning] = useState(false)
  const [backendLoading, setBackendLoading] = useState(true)

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL)
      .then(() => setBackendRunning(true))
      .catch(() => setBackendRunning(false))
      .finally(() => setBackendLoading(false))
  }, [])

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
    };

    getSession();
  }, []);

  async function handleSignin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
        
      },
    });
    
  }

  async function handleSignout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <div className="min-h-dvh bg-amber-800/85 text-white relative">
        <div className="flex flex-col relative top-20 justify-center items-center gap-y-4">
          <div>
            <div className="flex flex-col items-center mb-6">
            <ComicText>Welcome to</ComicText>
            <ComicText>Notepad++</ComicText>
            </div>
            <div className="flex flex-col items-center font-medium ">
              <div className="text-white font-bold text-lg md:text-xl tracking-tight mb-6 drop-shadow-sm">Write freely. Find instantly.</div>
              <div className="text-white/90 flex flex-col items-center text-sm md:text-base leading-relaxed max-w-2xl mb-10 font-medium drop-shadow-sm"> 
                <div>Notepad++ helps you capture thoughts and retrieve them using AI-powered semantic</div>
                <div>search. Search notes the way you think. Embeddings let you find ideas by meaning, not</div>
                <div>phrasing.</div>
              </div>
            </div>
          </div>
          <div>
          {backendLoading ? (
    <div className="flex flex-col items-center gap-3">
      <svg
        className="h-8 w-8 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-white/70 text-sm">
        May take up to 30 seconds on first load — hang tight!
      </p>
    </div>
  ) : backendRunning ? (
    session == null ? (
      <button onClick={handleSignin} className="bg-white text-black flex flex-row items-center px-6 py-3 gap-x-3 rounded-full hover:text-white hover:bg-blue-400 hover:cursor-pointer">
        <img className="h-[25px] w-[25px]" src={googleIcon} />
        <div className="font-medium">Sign in with Google</div>
      </button>
    ) : (
      <button onClick={() => navigate("/dashboard")} className="bg-white text-gray-800 hover:bg-gray-50 transition-all duration-300 rounded-full px-8 py-3.5 font-semibold text-sm flex items-center gap-3 shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 group hover:cursor-pointer">
        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>

        {/* ...same google svg + continue as name... */}
        <span>Continue as {session.user.user_metadata.name}</span>

        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="arrow-right" className="lucide lucide-arrow-right w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
      </button>
    )
  ) : (
    <p className="text-red-300 text-sm">Could not reach the server. Please try refreshing.</p>
  )}
          
          </div>
          
          
        </div>
      

      <div className="absolute bottom-0 bg-[#29150B] w-full text-[#FFFFFF]/60 text-xs py-5 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 z-20">
        <div>
          <img className="h-6" src={logo}></img>
        </div>
        <div className="flex gap-6 text-medium">
          <div className="hover:text-white transition-colors cursor-pointer">
            about
          </div>
          <div className="hover:text-white transition-colors cursor-pointer">
            terms
          </div>
          <div className="hover:text-white transition-colors cursor-pointer">
            privacy
          </div>
          <div className="hover:text-white transition-colors cursor-pointer">
            <a href="https://github.com/devbhavy/Notepad-plusplus">github</a>
            
          </div>
        </div>
        <div className="text-sm font-medium tracking-wide">
          made by <a className="no-underline text-gray-200 hover:underline underline-offset-2" href="https://github.com/devbhavy">@devbhavy</a>
        </div>
      </div>
      <div>
        {
          session!=null?<div className="absolute top-0 right-0 px-10 py-5 font-bold">
            <a className="hover:underline cursor-pointer underline-offset-1" onClick={handleSignout}>Sign out</a>
          </div>:<div></div>
        }
      </div>
    </div>
  );
}




{/* <button onClick={()=>navigate("/dashboard")} className="bg-white text-gray-800 hover:bg-gray-50 transition-all duration-300 rounded-full px-8 py-3.5 font-semibold text-sm flex items-center gap-3 shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 group hover:cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span>Continue as {session.user.user_metadata.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="arrow-right" className="lucide lucide-arrow-right w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button> */}
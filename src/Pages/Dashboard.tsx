import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import axios from "axios";
import GoogleIcon from "../assets/google.png"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


interface Data{
    notes : any[];
}

interface Note{
    id : string;
    content : string;
    deleted : boolean;
    createdAt : string;
    profileId : string;
    embedding : any[];
}

export function Dashboard(){

    const [session, setSession] = useState<any>(null);
    const [loading,setLoading] = useState(false);
    const [data, setData] = useState<Data | null>(null);
    const [visibile,setVisible] = useState(false)


    const [input,setInput] = useState("");
    
    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if(!data.session){
                navigate("/");

            }else{
                setSession(data.session);
            }
            
        };

        getSession();
    }, []);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (!session) navigate("/");
            else setSession(session);
          }
        );
      
        return () => listener.subscription.unsubscribe();
    }, []);
    
    
    async function handleSignout() {
        await supabase.auth.signOut();
        setSession(null);
    }
    
    function formatTimeAgo(date :Date) {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
      
        if (diffSeconds < 60) {
          return 'just now';
        }
        
        if (diffMinutes < 60) {
          return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        if (diffHours < 24) {
          return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        if (diffDays < 7) {
          return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = then.getDate();
        const month = months[then.getMonth()];
        const year = then.getFullYear();
        const currentYear = now.getFullYear();
        
        if (year === currentYear) {
          return `${day} ${month}`;
        }
        
        return `${day} ${month} ${year}`;
    }

    function splitNote(content :string, bodyLimit = 100) {
        const newlineIndex = content.indexOf("\n");
      
        
        if (newlineIndex === -1) {
          return {
            title: content.slice(0, bodyLimit),
            body: content.length > bodyLimit ? content.slice(bodyLimit) + "..." : ""
          };
        }
      
        const title = content.slice(0, newlineIndex);
        const body = content.slice(newlineIndex + 1);
      
        const truncatedBody =
          body.length > bodyLimit
            ? body.slice(0, bodyLimit) + "..."
            : body;
      
        return { title, body: truncatedBody };
    }
      
    
    const timeout : any = useRef(null);
    async function debouncedHandleInput(e : any){
        setVisible(false)
        clearTimeout(timeout.current)
        timeout.current = setTimeout(()=>{
            setInput(e.target.value);
        },50)
    }

    useEffect(() => {
        const fetchData = async () => {
            if(input.length === 0 || input==="/") {
                setData(null);
                return;
            }
            
            if(input.startsWith("/")) {
                setData(null);
                return;
            }
            
            if(!session?.access_token) return;
            
            setLoading(true);
            try {
                const response = await axios.post(`${BACKEND_URL}/app/user/fetchUsingEmbedding`,{
                    text : input
                },{
                    headers : {
                        Authorization : `Bearer ${session.access_token}`
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [input, session?.access_token])

    async function handleSubmit(e : any){
        e.preventDefault();
        if(input.startsWith("/")){
            
            if(input === "/a"){
                setLoading(true);
                try{
                    const response = await axios.get(`${BACKEND_URL}/app/user/fetchAllNotes`,{
                        headers : {
                            Authorization : `Bearer ${session.access_token}`
                        }
                    });
                    setData(response.data);
                }catch(err){
                    console.log("some error occurred fetching the data!")   
                }finally{
                    setLoading(false);
                }
            }
            else if(input ==="/c"){
                navigate("/dashboard/create")
            }
            else if(input==="/ac"){
                setVisible(true);
                setTimeout(()=>{
                    setVisible(false)
                },10000)

            }
            else {
                alert("Invalid command");

            }
        }
    }

    if (!session) return null;

    return(
        <div className="h-dvh overflow-hidden bg-amber-900 text-white flex flex-col items-center p-6 pt-40">
            
            <div className="bg-amber-800/50 rounded-2xl  border-2 border-orange-300/20 overflow-hidden">
                <form onSubmit={handleSubmit}> 
                    <input onChange={debouncedHandleInput} type="text" className="bg-amber-800 p-5 font-medium w-3xl text-xl rounded-t-2xl active:border-0 focus:outline-none focus:ring-0" placeholder="Search or command..." />


                </form>
                {input==="" || input==null?<div className="p-5 bg-amber-800 border-t-2 border-orange-300/10 font-medium">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-row gap-x-2 items-center">
                            <div className="bg-orange-300/20 px-3 py-2  rounded-md">/c</div>
                            <div>create new note</div>
                        </div>
                        <div className="flex flex-row gap-x-2 items-center">
                            <div className="bg-orange-300/20 px-3 py-2  rounded-md">/a</div>
                            <div>view all notes</div>
                        </div>
                        <div className="flex flex-row gap-x-2 items-center">
                            <div className="bg-orange-300/20 px-3 py-2  rounded-md">/ac</div>
                            <div>account details</div>
                        </div>

                    </div>
                    
                </div>:<></>


                
                }
                
            </div>

            {((!input.startsWith("/") && (input !== "" && input !== null)) || (data !== null && data !== undefined && input !== "" && input !== null)) && (
                <div className="inline-block mt-5 bg-amber-800 w-3xl h-[350px] overflow-auto rounded-3xl border-2 border-orange-300/10">
                    <div className="p-[5px]">
                        {loading?<div className="p-5">
                            {'>  '} {input.startsWith("/") ? "loading..." : "searching..."}
                        </div>:
                        <div>
                            {data==null?<div></div>:
                            <div className="flex flex-col w-full">
                                {data.notes.map((note:Note,index)=>{
                                    const date = new Date(note.createdAt)
                                    const {title,body} = splitNote(note.content,100) 
                                    return(
                                        <div className={`p-5 ${index==0?``:`border-t-2 border-orange-300/10`}`} key={note.id} onClick={()=>navigate(`/dashboard/${note.id}`)}>
                                            <div className={`p-3 w-full flex flex-row justify-between gap-x-4 rounded-xl hover:cursor-pointer hover:bg-amber-700/50 transition-colors`}>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                  <div className="font-semibold truncate">{title || "Untitled"}</div>
                                                  <div className="text-white/80 text-sm break-all overflow-hidden max-h-16 leading-5">
                                                    {body}
                                                  </div>
                
                                                </div>
                                                <div className="flex flex-col shrink-0 text-sm text-white/80">
                                                    <div className="whitespace-nowrap">{`${formatTimeAgo(date)}`}</div>
                                            
                                                </div>
                                            </div>

                                        </div>
                                    )
                                })}
                                
                            </div>
                            }

                        </div>
                        
                        }
                    </div>
                </div>
            )}

            <div className="top-0 left-0 right-0 h-20  fixed px-5 py-5">
                
                <div onClick={()=>navigate("/")} className="hover:underline underline-offset-2 cursor-pointer">{`<  return to landing page`}</div>

            </div>

            <div className={`w-md flex flex-col items-center justify-center mt-3 p-5 bg-amber-800 border-2 border-orange-300/10 rounded-2xl ${visibile?"visble":"hidden"}`}>
                <div className="p-3">
                    <img src={GoogleIcon} className="h-[50px]"></img>
                </div>
                <div className="font-bold">
                    {`@${session.user.user_metadata.name}`}
                </div>
                <div className="text-sm text-[#FFFFFF]/60">
                    {`logged in as : ${session.user.email}`}
                </div>
                <div>
                    <a className="hover:underline underline-offset-1 cursor-pointer font-medium" onClick={handleSignout}>click to signout</a>
                </div>
                
            </div>
            
            
                
        </div>
    )
}



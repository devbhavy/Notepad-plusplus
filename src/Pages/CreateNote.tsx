import axios from "axios";
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { Editor } from "@tiptap/core";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log(BACKEND_URL)

export function CreateNote(){
    const [editor,setEditor] = useState<Editor | null>(null);
    const [temp,setTemp] =useState(true);

    
    const [session,setSession] =useState<any>(null);
    const navigate = useNavigate()

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
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleSubmit();
            }
            else if (e.ctrlKey && e.code === 'KeyD') {
                e.preventDefault();
                navigate("/dashboard")
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [editor, session]);


    useEffect(()=>{
        const timeoutId = window.setTimeout(()=>{
            setTemp(false)
        },10000)

        return () => {
            window.clearTimeout(timeoutId);
        };
    },[])

    async function handleSubmit(){
        if(editor?.getText().length==0){
            return navigate("/dashboard")
        }

        try{
            await axios.post(`${BACKEND_URL}/app/user/create`,{
                data : editor?.getText(),
                contentJson : editor?.getJSON()
            },{
                headers : {
                    Authorization : `Bearer ${session.access_token}`
                }
            });
            
            navigate("/dashboard")
        }catch(err){
            alert("some error occurred while creating the node")
        }
    }


    return (
        <div>
            <form>
                <SimpleEditor onEditorReady={setEditor}/>
            </form>
            <div
                className={`fixed bottom-10 right-10 text-gray-500 font-mono text-medium text-text-muted text-right select-none duration-500 transition-opacity flex flex-col gap-0.5 ${temp ? "" : "opacity-0"}`}
            >
                <div>markdown supported</div>
                <div>press ctrl+d to return without saving</div>
                <div>press esc to save and exit</div>
            </div>
            

            
        </div>
    )
}




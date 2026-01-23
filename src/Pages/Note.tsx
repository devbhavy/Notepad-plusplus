import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router"
import { supabase } from "../lib/supabase";
import type { Editor } from "@tiptap/core";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function Notes(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [session,setSession] = useState<any>(null);
    const [temp,setTemp] =useState(true);


    const [data,setData] = useState<any>(null);
    const [editor,setEditor] = useState<Editor | null>(null);

    const [loading,setLoading] = useState(false)

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if(!data.session){
                navigate("/");

            }else{
                setSession(data.session);
                setLoading(true)
                try{
                    const response = await axios.get(`${BACKEND_URL}/app/user/fetchNote/${id}`,{
                        headers : {
                           Authorization : `Bearer ${data.session.access_token}`
                        }
                    })
                    setData(JSON.parse(`${response.data.json_content}`));

                }catch(err){
                    alert("Invalid note id");
                    navigate("/dashboard")     
                }
                finally{
                    setLoading(false)
                }
                

                


            }
            
            
        };

        getSession();
    }, [id, navigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            
            let keysPressed :any = {};
            keysPressed[e.key] = true

            if (e.key === "Escape") {    
                handleSubmit();
            }
            if (e.ctrlKey && e.code === 'KeyD') {
                e.preventDefault();
                handleDelete()
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
        try{
            await axios.post(`${BACKEND_URL}/app/user/updateNote/${id}`,{
                content : editor?.getText(),
                json_content : editor?.getJSON()
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

    async function handleDelete(){
        try{
            await axios.get(`${BACKEND_URL}/app/user/deleteNote/${id}`,{
                headers :{
                    Authorization : `Bearer ${session.access_token}`
                }
            })
            console.log({
                msg : "note successfully deleted"
            })
            navigate("/dashboard")
        }catch(err){
            console.log({
                msg : "some error occurred deleting the note"
            }
                
            )
            navigate("/dashboard");
        }
    }
    



    return(
        <div>
            {loading?<div>
                loading...</div>:
            <div>
                <form>
            <SimpleEditor onEditorReady={setEditor} input={data}/>

            </form>
            <div
            className={`fixed bottom-10 right-10 text-gray-500 font-mono text-medium text-text-muted text-right select-none duration-500 transition-opacity flex flex-col gap-0.5 ${temp ? "" : "opacity-0"}`}
        >
                <div>markdown supported</div>
                <div>press ctrl+d to delete</div>
                <div>press esc to save and exit</div>
            </div> 
            </div>   
            }
            
        </div>
    )
}
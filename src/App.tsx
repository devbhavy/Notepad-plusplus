import {BrowserRouter, Route, Routes} from "react-router"
import { Landing } from "./Pages/Landing"
import { Dashboard } from "./Pages/Dashboard"
import { Notes } from "./Pages/Note"
import { CreateNote } from "./Pages/CreateNote"



export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/dashboard/:id" element={<Notes/>}></Route>
        <Route path="/dashboard/create" element={<CreateNote/>}></Route>
      </Routes>
    </BrowserRouter>
    
  )
}
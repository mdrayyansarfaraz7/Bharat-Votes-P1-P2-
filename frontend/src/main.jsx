import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Home from './components/home/Home.jsx'
import HowToVote from './components/HowToVote/HowToVote.jsx'
import Register from './components/Register/Register.jsx'
import Schedule from './components/Schedule/Schedule.jsx'
import IndivState from './components/IndivState/IndivState.jsx'
import Parties from './components/Parties/Parties.jsx'
import Verify from './components/Verify/verify.jsx'
import NotFound from './components/PageNotFound.jsx'

let router=createBrowserRouter(createRoutesFromElements(
  <>
     <Route path='/' element={<App/>}>
    <Route path='' element={<Home/>}/>
    <Route path='/HowToVote' element={<HowToVote/>}/>
    <Route path='/Register' element={<Register/>}/>
    <Route path='/Schedule' element={<Schedule/>}/>
    <Route path='/State/:state' element={<IndivState/>}/>
  </Route>
   <Route path='/parties/:state/:district/:name' element={<Parties />} />
   <Route path='/verify/:state/:district' element={<Verify/>} />
   <Route path='*' element={<NotFound/>} />

  </>

))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)

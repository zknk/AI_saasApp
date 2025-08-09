import React from 'react'
import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitle from './pages/BlogTitle'
import GenerateImages from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import Community from './pages/Community'
import { useAuth } from '@clerk/clerk-react'
import {Toaster} from 'react-hot-toast'
//index used to render the default component when the path matches

function App() {

  const {getToken}=useAuth()

  // useEffect(() => {
  //   getToken().then((token) => {
  //     console.log('User token:', token);
  //   }).catch((error) => {
  //     console.error('Error fetching user token:', error);
  //   });
  // },[])

  return (
    <div>
    <Toaster/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path= '/ai' element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path ='write-article' element={<WriteArticle/>}/>
          <Route path ='blog-title' element={<BlogTitle/>}/>
          <Route path ='generate-images' element={<GenerateImages/>}/>
          <Route path ='remove-background' element={<RemoveBackground/>}/>
          <Route path ='remove-object' element={<RemoveObject/>}/>
          <Route path ='review-resume' element={<ReviewResume/>}/>
          <Route path ='community' element={<Community/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
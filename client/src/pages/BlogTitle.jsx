import React from 'react'
import { Sparkle, Edit, Sparkles, Hash } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


function BlogTitle() {
   const blogCategories=['General','Technology','Health','Lifestyle','Education','Business'];
  
    const [selectedCategory,setSelectedCategory]=useState(blogCategories[0]);
  
    const[input,setInput]=useState("");

    const [loading,setLoading]=useState(false);
    const [content ,setContent]=useState("");
  

   const {getToken}=useAuth();
  
    const onSubmitHandler=async (e)=>{
      e.preventDefault();
      try{
         setLoading(true);

         const prompt=`Generate a blog title for ${input} in the category of ${selectedCategory}`;

         const {data}=await axios.post('/api/ai/generate-blog-title',{prompt},
          {headers: {Authorization: `Bearer ${await getToken()}`}})

          if(data.success){
            setContent(data.content);
          }
          else{
            toast.error(data.message || "Failed to generate title");
          }
         
      }
      catch(error){
        toast.error(error.message || "An error occurred while generating the title");
      }
      setLoading(false);
    }
  return (
    <div className='h-full overflow-y-scroll p-6 flex
         items-start flex-wrap  gap-4 text-slate-700'>
         {/*left col */}
        <form
          onSubmit={onSubmitHandler}
         className='w-full max-w-lg p-4 bg-white rounded-lg border
        border-gray-200'>
            <div>
                <Sparkles className='w-6 text-[#8E37EB]'/>
                <h1 className='text-xl font-semibold'>AI Title Generator</h1>
            </div>
            <p className='mt-6 text-sm font-medium'> Keyword</p>
            <input
              onChange={(e)=>setInput(e.target.value)}
              value={input}
              type='text' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
              border border-gray-300' placeholder='The futute of artificial inteligence is ...'/>
            <p className='mt-4 text-sm font-semibold'>Category</p>
    
            <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11 '>
                {blogCategories.map((item)=>(
                  <span
                    onClick={()=>setSelectedCategory(item)}
                    className={`text-xs px-4 py-1 border rounded-full cursor-pointer  
                      ${selectedCategory==item?'bg-purple-50 text-purple-700':
                      'text-gray-500 border-gray-300'}`} 
                    key={item}>{item}
                  </span>
                ))}
            </div>
            <br/>
            <button disabled={loading} className='w-full flex  justify-center items-center gap-2
              bg-gradient-to-r from-[#C341F9] to-[#8E37EB] text white px-4 py-2 mt-6
              text-sm rounded-lg cursor-pointer'>
                {
                  loading?<span className='animate-spin w-5 h-5 border-2 border-t-2 border-white rounded-full'></span>:<Hash className='w-5'/>
                }
                
                Generate Title
            </button>
        </form>
    
        {/*right col */}
        <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex  flex-col border
        border-gray-200 min-h-96 '>

          <div className='flex items-center gap-2'>
            <Hash className='w-5 h-5 text-[#8E37EB]'/>
            <h1 className='text-xl font-semibold'>Generated Title</h1>
          </div>
           {
            !content ?(
              <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                  <Hash className='w-9 h-9'/>
                   <p className=' mt-2 text-sm text-gray-500'>Your Title  will be generated here</p>
            </div>
          </div>
            ):(
               <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                        <div className='reset-tw'>
                        <Markdown>
                        {content}
                        </Markdown>
                        </div>
                      </div>
            )
           }
          
        </div>
        </div>
  )
}

export default BlogTitle
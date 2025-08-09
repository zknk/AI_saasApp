import { Edit, Sparkle } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { use } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';



axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;




function WriteArticle() {

  

  const articleLength=[
    {length:800,text:'Short(500-800)'},
    {length:1200,text:'Medium(800-1200)'},
    {length:1600,text:'Long(1200+words)'},
    
  ]

  const [selectedLength,setSelectedLength]=useState(articleLength[0]);

  const[input,setInput]=useState("");

  const [loading,setLoading]=useState(false);
  const [content ,setContent]=useState("");
  

  const {getToken}=useAuth();
const onSubmitHandler = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const token = await getToken();
    if (!token) {
      toast.error("Authentication token missing");
      setLoading(false);
      return;
    }

    const prompt = `Write an article on ${input} with ${selectedLength.length} words`;

    console.log("Sending request with prompt:", prompt);

    const { data } = await axios.post(
      '/api/ai/generate-article',
      { prompt, length: selectedLength.length },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Response:", data);

    if (data.success) {
      setContent(data.content);
    } else {
      toast.error("Failed to generate article");
    }
  } catch (error) {
    console.error("Error generating article:", error.response || error.message);
    toast.error("An error occurred while generating the article");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className='h-full overflow-y-scroll p-6 flex
     items-start flex-wrap  gap-4 text-slate-700'>
     {/*left col */}
    <form
      onSubmit={onSubmitHandler}
     className='w-full max-w-lg p-4 bg-white rounded-lg border
    border-gray-200'>
        <div>
            <Sparkle className='w-6 text-[#4A7AFF]'/>
            <h1 className='text-xl font-semibold'>Article Confriguration</h1>
        </div>
        <p className='mt-6 text-sm font-medium'> Article Topic</p>
        <input
          onChange={(e)=>setInput(e.target.value)}
          value={input}
          type='text' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
          border border-gray-300' placeholder='The futute of artificial inteligence is ...'/>
        <p className='mt-4 text-sm font-semibold'>Article Length</p>

        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11 '>
            {articleLength.map((item,index)=>(
              <span
                onClick={()=>setSelectedLength(item)}
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer  
                  ${selectedLength.text==item.text?'bg-blue-50 text-blue-700':
                  'text-gray-700 border-gray-700'}`} 
                key={index}>{item.text}
              </span>
            ))}
        </div>
        <br/>
        <button disabled={loading} className='w-full flex  justify-center items-center gap-2
          bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text white px-4 py-2 mt-6
          text-sm rounded-lg cursor-pointer'>
             {
              loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.243A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.695z"></path>
                </svg>
              ) : null
             }
            <Edit className='w-5'/>
            Generate Article
        </button>
    </form>

    {/*right col */}
    <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex  flex-col border
    border-gray-200 min-h-96 max-h-[600px]'>
      <div className='flex items-center gap-2'>
        <Edit className='w-5 h-5 text-[#4A7AFF]'/>
        <h1 className='text-xl font-semibold'>Generated Article</h1>
      </div>
      {!content?(
        <div className='flex-1 flex justify-center items-center'>
        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Edit className='w-9 h-9'/>
               <p className=' mt-2 text-sm text-gray-500'>Your article will be generated here</p>
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
      )}
      
    </div>
    </div>
  )
}
 
export default WriteArticle
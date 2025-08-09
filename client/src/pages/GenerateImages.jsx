import React from 'react'
import { Sparkle, Edit, Sparkles, Hash,Image } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';




axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


function GenerateImages() {

  const ImageStyle=['Realistic style','Cartoon style','Anime style','Artistic style','Fantasy style','3D style',
    'Portrait style','Landscape style'
  ];
    
      const [selectedStyle,setSelectedStyle]=useState(ImageStyle[0]);
    
      const[input,setInput]=useState("");
    
      const [publish,setPublish]=useState(false);

        const [loading,setLoading]=useState(false);
        const [content ,setContent]=useState("");
        
      
        const {getToken}=useAuth();


      const onSubmitHandler=async (e)=>{
        e.preventDefault();
        try{
          setLoading(true);
          const prompt=`Generate an image of ${input} in the style of ${selectedStyle}`;
          const {data}=await axios.post('/api/ai/generate-image',{prompt,publish},
            {headers: {Authorization: `Bearer ${await getToken()}`}})
          if(data.success){
            setContent(data.content);
          }
          else{
            toast.error(data.message || "Failed to generate image");
          }

        }
        catch(error){ 
          toast.error(error.message || "An error occurred while generating the image");
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
                <Sparkles className='w-6 text-[#00AD25]'/>
                <h1 className='text-xl font-semibold'>AI Title Generator</h1>
            </div>
            <p className='mt-6 text-sm font-medium'>Describe Your Image</p>
            <textarea
              onChange={(e)=>setInput(e.target.value)}
              value={input} rows={4}
              type='what you want to see in the image' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
              border border-gray-300' placeholder='The futute of artificial inteligence is ...'/>

            <p className='mt-4 text-sm font-semibold'>Style</p>
    
            <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11 '>
                {ImageStyle.map((item)=>(
                  <span
                    onClick={()=>setSelectedStyle(item)}
                    className={`text-xs px-4 py-1 border rounded-full cursor-pointer  
                      ${selectedStyle==item?'bg-green-50 text-green-700':
                      'text-gray-500 border-gray-300'}`} 
                    key={item}>{item}
                  </span>
                ))}
            </div>
            
          <div className='my-6 flex items-center gap-2'>
              <label className='relative cursor-pointer'>
                <input
                  type='checkbox'
                  checked={publish}
                  onChange={(e)=>setPublish(e.target.checked)}
                  className='sr-only peer' />
                <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 
                transition'></div>
                <span className='absolute left-1 top-1 w-3 h-3 bg-white 
                rounded-full transition peer-checked:translate-x-4'></span>
                </label>
                <p>Publish to Gallery</p>
          </div>
         
            <button disabled={loading}  className='w-full flex  justify-center items-center gap-2
              bg-gradient-to-r from-[#00AD25] to-[#04FF50] text white px-4 py-2 mt-6
              text-sm rounded-lg cursor-pointer'>
                {
                  loading?<span className='animate-spin w-5 h-5 border-2 border-t-2 border-white rounded-full'></span>:<Image className='w-5'/>
                } 
                Generate Image
            </button>
        </form>
    
        {/*right col */}
        <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex  flex-col border
        border-gray-200 min-h-96 '>

          <div className='flex items-center gap-2'>
            <Image className='w-5 h-5 text-[#00AD25]'/>
            <h1 className='text-xl font-semibold'>Generated Image</h1>
          </div>
           {
            !content?(
                    <div className='flex-1 flex justify-center items-center'>
                  <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                        <Image className='w-9 h-9'/>
                        <p className=' mt-2 text-sm text-gray-500'>Your Image  will be generated here</p>
                  </div>
                </div>
            ):(
              <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                <img src={content} className='w-full h-full'/>
              </div>
            )
           }
         
        </div>
        </div>
  )
}

export default GenerateImages
// import React from 'react'
// import { Eraser, Sparkles } from 'lucide-react';
// import { useState } from 'react';

// function RemoveBackground() {

//   const[input,setInput]=useState("");
    
//       const onSubmitHandler=async (e)=>{
//         e.preventDefault();
//       }
//   return (
//    <div className='h-full overflow-y-scroll p-6 flex
//          items-start flex-wrap  gap-4 text-slate-700'>
//          {/*left col */}
//         <form
//           onSubmit={onSubmitHandler}
//          className='w-full max-w-lg p-4 bg-white rounded-lg border
//         border-gray-200'>
//             <div>
//                 <Sparkles className='w-6 text-[#FF4938]'/>
//                 <h1 className='text-xl font-semibold'>BackGround Removal</h1>
//             </div>
//             <p className='mt-6 text-sm font-medium'> Upload Image</p>
//             <input
//               onChange={(e)=>setInput(e.target.files[0])}
//               accept='image/*'
//               type='file' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
//               border border-gray-300 text-gray-600' required />

//             <p className='text-xs text-gray-500 font-light mt-1'>Supports Jpg,png and other image format</p>
//             <button className='w-full flex  justify-center items-center gap-2
//               bg-gradient-to-r from-[#F6Ab41] to-[#FF4938] text white px-4 py-2 mt-6
//               text-sm rounded-lg cursor-pointer'>
//                 <Eraser className='w-5'/>
//                 Generate Title
//             </button>
//         </form>
    
//         {/*right col */}
//         <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex  flex-col border
//         border-gray-200 min-h-96 '>

//           <div className='flex items-center gap-2'>
//             <Eraser className='w-5 h-5 text-[#FF4938]'/>
//             <h1 className='text-xl font-semibold'>Processed Image</h1>
//           </div>
    
//           <div className='flex-1 flex justify-center items-center'>
//             <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
//                   <Eraser className='w-9 h-9'/>
//                    <p className=' mt-2 text-sm text-gray-500'>Remove Background to get started</p>
//             </div>
//           </div>
//         </div>
//         </div>
//   )
// }

// export default RemoveBackground

import React, { useState } from 'react';
import { Eraser, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function RemoveBackground() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setContent(data.content);
        toast.success("Background removed successfully!");
      } else {
        toast.error(data.message || "Failed to process image");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred while processing the image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div>
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />
        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG and other image formats
        </p>
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6Ab41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="animate-spin w-5 h-5 border-2 border-t-2 border-white rounded-full"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>

      {/* right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-2">
          <Eraser className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Eraser className="w-9 h-9" />
              <p className="mt-2 text-sm text-gray-500">
                Remove Background to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <img src={content} alt="Processed" className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export default RemoveBackground;

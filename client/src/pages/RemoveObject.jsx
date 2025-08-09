// import React from 'react'
// import { Eraser, Scissors, Sparkles } from 'lucide-react';
// import { useState } from 'react';

// function RemoveObject() {
  
//     const[input,setInput]=useState("");
//     const [object,setObject]=useState('');
      
//         const onSubmitHandler=async (e)=>{
//           e.preventDefault();
//         }
//   return (
//     <div className='h-full overflow-y-scroll p-6 flex
//          items-start flex-wrap  gap-4 text-slate-700'>
//          {/*left col */}
//         <form
//           onSubmit={onSubmitHandler}
//          className='w-full max-w-lg p-4 bg-white rounded-lg border
//         border-gray-200'>
//             <div>
//                 <Sparkles className='w-6 text-[#4A7AFF]'/>
//                 <h1 className='text-xl font-semibold'>Object Removal</h1>
//             </div>
//             <p className='mt-6 text-sm font-medium'> Upload Image</p>
//             <input
//               onChange={(e)=>setInput(e.target.files[0])}
//               accept='image/*'
//               type='file' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
//               border border-gray-300 text-gray-600' required />
              
//               <p className='text-xs text-gray-500 font-light mt-1'>Describe object name to remove </p>
//               <textarea
//               onChange={(e)=>setObject(e.target.value)}
//               value={object} rows={4}
//               type='what you want to see in the image' className='w-full p-2 px-3
//                mt-2 outline-none text-sm rounded-md
//               border border-gray-300'
//                placeholder='Watch or spoon , Only single object name'/>


//             <button className='w-full flex  justify-center items-center gap-2
//               bg-gradient-to-r from-[#417DF6] to-[#8E37EB]
//                text white px-4 py-2 mt-6
//               text-sm rounded-lg cursor-pointer'>
//                 <Scissors className='w-5'/>
//                 Remove Object
//             </button>
//         </form>
    
//         {/*right col */}
//         <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex  flex-col border
//         border-gray-200 min-h-96 '>

//           <div className='flex items-center gap-2'>
//             <Scissors className='w-5 h-5 text-[#4A7AFF]'/>
//             <h1 className='text-xl font-semibold'>Processed Image</h1>
//           </div>
    
//           <div className='flex-1 flex justify-center items-center'>
//             <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
//                   <Scissors className='w-9 h-9'/>
//                    <p className=' mt-2 text-sm text-gray-500'>Upload an image and click remove object to get started</p>
//             </div>
//           </div>
//         </div>
//         </div>
//   )
// }

// export default RemoveObject



import React, { useState } from 'react'
import { Scissors, Sparkles } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


function RemoveObject() {
  const [input, setInput] = useState(null) // file
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!input) {
      toast.error('Please upload an image')
      return
    }
    if (!object.trim()) {
      toast.error('Please enter an object name')
      return
    }

    try {
      setLoading(true)

      if(object.split(' ').length > 1) {
        toast.error('Please enter only one object name')
        return
      }

      const formData = new FormData()
      formData.append('image', input) // matches req.file
      formData.append('object', object) // matches req.body.object

      const token = await getToken()
      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data.success) {
        setContent(data.content)
        toast.success('Object removed successfully!')
      } else {
        toast.error(data.message || 'Failed to remove object')
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while removing object')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div>
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium"> Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
              border border-gray-300 text-gray-600"
          required
        />

        <p className="text-xs text-gray-500 font-light mt-1">
          Describe object name to remove
        </p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={2}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
              border border-gray-300"
          placeholder="Watch or spoon (only one object)"
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2
              bg-gradient-to-r from-[#417DF6] to-[#8E37EB]
               text white px-4 py-2 mt-6
              text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="animate-spin w-5 h-5 border-2 border-t-2 border-white rounded-full"></span>
          ) : (
            <Scissors className="w-5" />
          )}
          Remove Object
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="w-9 h-9" />
              <p className="mt-2 text-sm text-gray-500">
                Upload an image and click remove object to get started
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
  )
}

export default RemoveObject

import React, { useState } from 'react'
import axios from 'axios'
import { FileText, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react'
import Markdown from 'react-markdown'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

function ReviewResume() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('resume', input) // matches req.file

      const token = await getToken()
      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message || 'Failed to review resume')
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while reviewing resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'
      >
        <div>
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload Resume</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          accept='application/pdf'
          type='file'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
        />

        <p className='text-xs text-gray-500 font-light mt-1'>
          Supports PDF resume only
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='w-5 h-5 animate-spin' />
              Reviewing...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <FileText className='w-5' />
              Review Resume
            </div>
          )}
        </button>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] overflow-y-auto'>
        <div className='flex items-center gap-2'>
          <FileText className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Analysis Results</h1>
        </div>

        <div className='flex-1 flex justify-center items-center'>
          {content ? (
           <div className='reset-tw'>
            <Markdown>
            {content}
            </Markdown>
            </div>
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <FileText className='w-9 h-9' />
              <p className='mt-2 text-sm text-gray-500'>
                Upload resume to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewResume

import React, { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({item}) => {
    const [expanded,setExpanded]=useState();
  return (
    <div onClick={()=>setExpanded(!expanded)} className='p-4 max-w-5xl texxt-sm bg-white border border-gray-200 
    rounded-lg cursor-pointer'>
        <div  className='flex justify-between items-center gap-4'>
              <div>
                   <h2>{item.prompt}</h2>
                   <p className='text-gray-500'>{item.type}-{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <button className='bg-[#EFF6FF] border border-[#BFDBFE]
              text-[#1E40AF] px-4 py-1 rounded-full'>{item.type}</button>
        </div>
        {
            expanded&& (
                <div>
                     {item.type==='image'?(
                        <div>
                            <img src={item.content} className='mt-3 w-full max-w-md'/>
                        </div>
                     ):(<div className='mt-3 h-full overflow-y-scroll text-sm text-slte-700'>
                                <div className='reset-tw'>
                                <Markdown>{item.content}</Markdown>
                                </div>
                        </div>)}
                </div>
            )
        }
    </div>
  )
}

export default CreationItem
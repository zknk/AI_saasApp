import { useAuth, useUser } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import { useState } from 'react';
import {dummyPublishedCreationData} from '../assets/assets';
import { Heart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;



function Community() {

  const [creations, setCreations] = useState([]);
  const {user}=useUser();
  
  const [loading, setLoading] = useState(true);

  const getToken = useAuth();


  const fetchCreations = async () => {
    // Fetch creations from the server or API 
    try{
      const {data}= await axios.get('/api/user/get-published-creations', {
        headers: {
          Authorization: `Bearer ${await getToken.getToken()}`,
        },
      });
      if(data.success){
        setCreations(data.creations);
      } else {
        toast.error(data.message || 'Failed to fetch creations');
      }
    }
    catch(error) {
      setLoading(false);
      toast.error(error.message || 'An error occurred while fetching creations');
    }
    setLoading(false);
  }

  const imageLikeToggle=async (id)=>{
    try{
       const {data} = await axios.post('/api/user/toggle-like-creation', {id}, {
        headers: {  
          Authorization: `Bearer ${await getToken.getToken()}`,
        },
      });
      if(data.success){
        toast.success(data.message || 'Like toggled successfully');
        await fetchCreations();
      }
      else{
        toast.error(data.message || 'Failed to toggle like');
      }

    }
    catch(error) {
      toast.error(error.message || 'An error occurred while toggling like');
    }

  }

  useEffect(() => {
    if(user){
      fetchCreations();
    }
  }, [user]);

  return !loading ? (
    <div   className='flex-1 h-full flex flex-col gap-4 p-6'>
    Creations
       <div className='bg-white h-fll w-full rounded-xl overflow-y-scroll'>
           {
            creations.map((creations,index)=>(
              <div key={index}  className='relative group inline-block pl-3 pt-3 w-full
              sm:max-w-1/2 lg:max-w-1/3'>
                 <img src={creations.content} alt={creations.title}
                  className='w-full h-full object-cover rounded-lg'/>
                    <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2
                    items-end justify-end group-hover:jussstify-between p-3
                    group-hover:bg-gradient-to-b from-transparent to-black/80
                    text-white rounded-lg
                    '>
                        <p  className='text-sm hidden group-hover:block'>{creations.prompt}</p>
                        <div  className='flex gap-1 items-center'>
                            <p>{creations.likes.length}</p>
                            <Heart onClick={()=>imageLikeToggle(creations.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer
                              ${creations.likes.includes(user.id)?'fill-res-500 text-red-600':'text-white'}`} />
                        </div>
                    </div>
              </div>
            ))
           }
       </div>
    </div>
  )
  :(
     <div className="flex  flex-col justify-center items-center h-full gap-2">
      <div className="w-8 h-8 border-4 border-[#00DA83] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">Processing...</p>
    </div>
  )
}

export default Community
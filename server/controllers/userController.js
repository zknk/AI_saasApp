import sql from '../config/db.js'

export const getUserCreations = async (req, res) => {
    try {
        const {userId} = req.auth()

        const creations= await sql `select * from creations where user_id =${userId} order
        by created_at desc`;

        res.json({success:true,creations});
        // console.log('User creations fetched successfully:', creations); 

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user creations',
            error: error.message
        });
    }
}




export const getPublishCreations = async (req, res) => {
    try {
        

        const creations= await sql `select * from creations where publish=true order
        by created_at desc`;

        res.json({success:true,creations});
        

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user creations',
            error: error.message
        });
    }
}





export const toggleLikeCreation = async (req, res) => {
    try {
        
        const {userId}=req.auth();

        const {id}=req.body;

        const [creation]=await sql `select * from creations where id=${id}`;

        if(!creation){
            return res.status(404).json({
                success: false,
                message: 'Creation not found'
            });
        }

        const currentLikes=creation.likes;

        const userIdStr= userId.toString();

         let updatedLikes;
         let message;

         if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=> user !== userIdStr);
            message = 'Creation unliked successfully';
            } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation liked successfully';
            } 


        const formattedArray=`{${updatedLikes.join(',')}}`;

        await sql `update creations set likes=${formattedArray}::text[] where id=${id}`;

        res.json({success:true,message});
        
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user creations',
            error: error.message
        });
    }
}
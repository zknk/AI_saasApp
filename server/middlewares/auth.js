import { clerkClient } from '@clerk/express';

export const auth =async(req, res, next) => {
    try{
        const {userId,has} = await req.auth();
        const hasPremiumPlan=await has({plan:'premium'});

        const user= await clerkClient.users.getUser(userId);   
        
        if(!hasPremiumPlan && user.privateMetadata.free_usage){
            req.free_usage= user.privateMetadata.free_usage;
        }
        else{
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: error.message });
    }   
} 
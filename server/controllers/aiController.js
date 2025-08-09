import OpenAI from 'openai';
import Sql from '../config/db.js';
import { clerkClient } from '@clerk/express';
import axios from 'axios';
import {v2 as cloudinary} from 'cloudinary';
import FormData from 'form-data';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai'
});

export const generateArticle = async (req, res) => {
    try {
        const { userId } =  await req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;

        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        await Sql` INSERT INTO creations (user_id,prompt,content,type)
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;


        if (plan !== 'premium') {
            {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        free_usage: free_usage + 1
                    }
                })
            }
        }
        res.json({
            success: true,
            message: 'Article generated successfully',
            content,
        });
    }
    catch (error) {
        console.error('Error generating article:', error);
        res.status(500).json({ success: false, message: 'Failed to generate article', error: error.message });
    }
}





// export const generateBlogTitle = async (req, res) => {
//     try {
//         const { userId } =  await req.auth();
//         const { prompt} = req.body;
//         const plan = req.plan;

//         const free_usage = req.free_usage;

//         if (plan !== 'premium' && free_usage >= 10) {
//             return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' });
//         }

//         const response = await AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [
//                 {
//                     role: "user",
//                     content: prompt,
//                 },
//             ],
//             temperature: 0.7,
//             max_tokens: 100,
//         });

//         const content = response.choices[0].message.content;

//         await Sql` INSERT INTO creations (user_id,prompt,content,type)
//         VALUES (${userId}, ${prompt}, ${content}, 'blog-article')`;


//         if (plan !== 'premium') {
//             {
//                 await clerkClient.users.updateUserMetadata(userId, {
//                     privateMetadata: {
//                         free_usage: free_usage + 1
//                     }
//                 })
//             }
//         }
//         res.json({
//             success: true,
//             message: 'Article generated successfully',
//             content,
//         });
//     }
//     catch (error) {
//         console.error('Error generating article:', error);
//         res.status(500).json({ success: false, message: 'Failed to generate article', error: error.message });
//     }
// }


export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.status(403).json({ 
        success: false, 
        message: 'Free usage limit exceeded. Upgrade to premium for more requests.' 
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices?.[0]?.message?.content 
                 || response.choices?.[0]?.message?.content?.[0]?.text 
                 || "No content generated.";

    await Sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({
      success: true,
      message: 'Blog title generated successfully',
      content,
    });

  } catch (error) {
    console.error('Error generating blog title:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate blog title', 
      error: error.message 
    });
  }
};




export const generateImage = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({ 
                success: false, 
                message: 'Upgrade to premium for more requests.' 
            });
        }

        // Build the form data
        const form = new FormData();
        form.append('prompt', prompt);

        // console.log('Form data prepared for ClipDrop API:', form);
        // Call ClipDrop API
        const { data } = await axios.post(
            'https://clipdrop-api.co/text-to-image/v1',
            form,  // ✅ use the form instance
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                    // ...form.getHeaders() // ✅ required for multipart/form-data
                },
                responseType: 'arraybuffer',
            }
        );

        // console.log('Image data received from ClipDrop API');

        // Convert to base64
        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}` ;
              
        // console.log('Base64 Image:', base64Image);

        // Upload to Cloudinary
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        // Save to DB
        await Sql`
            INSERT INTO creations (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish})
        `;

        res.json({
            success: true,
            content: secure_url,
        });
    }
    catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate image', 
            error: error.message 
        });
    }
}







export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const plan = req.plan;

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No file uploaded" 
            });
        }

        if (plan !== 'premium') {
            return res.status(403).json({ 
                success: false, 
                message: 'Upgrade to premium for more requests.' 
            });
        }

        // Convert buffer to base64 for Cloudinary
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            transformation: [{
                effect: 'background_removal',
                background_removal: 'remove_the_background',
            }]
        });

        await Sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Remove background', ${secure_url}, 'image')
        `;

        res.json({
            success: true,
            content: secure_url,
        });
    }
    catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate image', 
            error: error.message 
        });
    }
}





// export const removeImageObject = async (req, res) => {
//     try {
//         const { userId } = await req.auth();
//         const {object}=req.body;
//         const { image } = req.file;
//         const plan = req.plan;


//         if (plan !== 'premium') {
//             return res.status(403).json({ 
//                 success: false, 
//                 message: 'Upgrade to premium for more requests.' 
//             });
//         }
       
//         const { public_id } = await cloudinary.uploader.upload(image.path);
         

//         const imageUrl= cloudinary.url(public_id,{
//             transformation:[{
//                 effect :`gen_remove${object}`
//             }],
//             resource_type: 'image',
//         })

        
//         // Save to DB
//         await Sql`
//             INSERT INTO creations (user_id, prompt, content, type)
//             VALUES (${userId},${`Removed ${object} from image`}, ${imageUrl}, 'image')
//         `;

//         res.json({
//             success: true,
//             content: imageUrl,
//         });
//     }
//     catch (error) {
//         console.error('Error generating image:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Failed to generate image', 
//             error: error.message 
//         });
//     }
// }




import streamifier from "streamifier";

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { object } = req.body;
    const file = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "Upgrade to premium for more requests.",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Decide effect based on object
    let effect;
    if (object.trim().toLowerCase() === "background") {
      effect = "background_removal";
    } else {
      effect = `gen_remove:${object}`;
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            success: false,
            message: "Cloudinary upload failed",
          });
        }

        const imageUrl = cloudinary.url(result.public_id, {
          transformation: [{ effect }],
          resource_type: "image",
          format: "png",
        });

        await Sql`
          INSERT INTO creations (user_id, prompt, content, type)
          VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
        `;

        res.json({
          success: true,
          content: imageUrl,
        });
      }
    );

    // ✅ Now actually send file buffer to Cloudinary
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Error removing object:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove object from image",
      error: error.message,
    });
  }
};






export const resumeReview = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const resume = req.file;  
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({ 
                success: false, 
                message: 'Upgrade to premium for more requests.' 
            });
        }

        if (!resume) {
            return res.status(400).json({
                success: false,
                message: 'No resume uploaded'
            });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 5MB limit.'
            });
        }

        // ✅ Use buffer directly instead of resume.path
        const dataBuffer = resume.buffer;
        const pdfData = await pdf(dataBuffer);
        
        const prompt = `Review the following resume and provide feedback on its strengths and
         areas for improvement. Focus on the content, structure, and overall presentation. 
         Here is the resume content: ${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        // Save to DB
        await Sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        res.json({
            success: true,
            content,
        });

    } catch (error) {
        console.error('Error reviewing resume:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to review resume', 
            error: error.message 
        });
    }
};

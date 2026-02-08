import axios from 'axios';
import Chat from "../models/chat.js";
import User from "../models/user.js";
import openai from '../configs/openai.js';


export const textMessageController = async (req, res) => {
    try{
        const userId = req.user._id

        if (req.user.credits < 1){
            return res.json({success: false, message: "Not enough credits"})
        }


        const { chatId, prompt} = req.body

        const chat = await Chat.findOne({ userId, _id: chatId })
        chat.message.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })

        const { choices } = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Explain to me how AI works",
        },
    ],
});
    const reply = {...choices[0].message, timestamp: Date.now(), isImage: false }
    res.json({success: true, reply})
    chat.message.push(reply)
    await chat.save()

    await User.updateOne({_id: userId}, { $inc: { credits: -1}})
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// For image generation, you can create a similar controller that uses the OpenAI API to generate images based on user prompts.

export const imageMessageController = async (req, res) => {
    try{
        const userId = req.user._id;
        if (req.user.credits < 2){
            return res.json({success: false, message: "Not enough credits"})
        }

        const { prompt, chatId, isPublished } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId })

        chat.message.push({role: "user", content: prompt, timestamp: Date.now(), isImage: false})

        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        //Construct ImageKit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-/${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        //Fetch the generated image
        const aiResponse = await axios.get(generatedImageUrl, {responseType: 'arraybuffer'})
    
        const base64Image = `data:image/png;base64,${Buffer.from(aiResponse.data,"binary").toString('base64')}`
    
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })

        const reply = {role: "assistant", content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished }
        res.json({success: true, reply})
        chat.message.push(reply)
        await chat.save()

        await User.updateOne({_id: userId}, { $inc: { credits: -1}})

    }
    catch (error){
        res.json({success: false, message: error.message});
    }
}
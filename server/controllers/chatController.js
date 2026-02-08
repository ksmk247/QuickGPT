import Chat from '../models/chat.js';

//API Controller for creating and fetching chat messages

export const createChat = async (req, res) => {
    try{
        const userId = req.user._id

        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name

        }

        await Chat.create(chatData);
        res.json({ success: true, messages: "Chat created successfully" });
    }
    catch (error){
        res.json({ success: false, message: error.message });
    }
}

// API Controller to get all chats of a user
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

        // Transform chats to include only the required fields with correct naming
        const formattedChats = chats.map(chat => ({
            id: chat._id,
            userid: chat.userId,
            username: chat.userName,
            name: chat.name,
            messages: chat.messages,
            createdat: chat.createdAt,
            updatedat: chat.updatedAt,
            __v: chat.__v
        }));

        return res.json({ success: true, chats: formattedChats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
 
// API Controller for deleting a chat

export const deleteChat = async (req, res) => {
    try{
        const userId = req.user._id
        const { chatId } = req.body

        await Chat.deleteOne({ _id: chatId, userId})

        res.json( { success: true, message: "Chat deleted successfully"} )
    }
    catch (error){
        res.json({ success: false, message: error.message})
    }
}
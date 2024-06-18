import React, { useEffect, useRef, useState } from 'react'
import "./chat.css";
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const endRef = useRef(null);
  const [text, setText] = useState("");
  const {chatId,user} = useChatStore();
  const {currentUser} = useUserStore();
  const {isCurrentUserBlocked, isReceiverBlocked} = useChatStore();
 const [img, setImg] = useState({
  file : null,
  url : "",
 });

  const handleImg  = (e) =>{
    if(e.target.files[0]){
      setImg({
        file : e.target.files[0],
        url : URL.createObjectURL(e.target.files[0])
      })
    }
  } 

  const handleEmoji = (e) =>{
    setText(prev=>prev+e.emoji);
    setOpen(false);
  }

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior : "smooth"})
  },[])

  useEffect(()=>{
    const unSub = onSnapshot(doc(db,"chats",chatId), (res)=>{
      setChat(res.data());
      console.log(res.data());
    })

    return ()=>{unSub()}
  },[])

  const handleSend = async () =>{
    if(text === "") return;

    let imgUrl = null;

    try{

      if(img.file){
        imgUrl = await upload(img.file);
      }
        await updateDoc(doc(db, "chats", chatId),{
          messages : arrayUnion({
            senderId : currentUser.id,
            text,
            createdAt : new Date(),
            ...(imgUrl && {img : imgUrl}),
          })
        })
        const userIDs = [currentUser.id, user.id];
        userIDs.forEach(async (id)=>{

          const userChatsRef = doc(db, "userchats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          
          if(userChatsSnapshot.exists()){
            const userChatsData = userChatsSnapshot.data();
            console.log("here");
            const chatIndex = userChatsData.chats.findIndex(
              (c)=> c.chatId === chatId
            )
            
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
            
            await updateDoc(userChatsRef,{
              
              chats : userChatsData.chats, 
              
            })
          }
        })
    }
    catch(err){
      console.log(err);
    }

    setImg({
      file : null,
      url : "",
    })

    setText(""); 
  }
  return (
    <div className='chat'>
      <div className="top">
        <div className="ct-user">
          <img src={ user?.avatar || "./avatar.png"} alt="" />
          <div className="ctu-texts">
            <span>{user?.username}</span>
            <p>Hello helo helo helo helo helo helo helo helo helo</p>
          </div>
        </div>
        <div className="ct-icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
      {chat?.messages?.map((message)=>(
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key = {message?.createdAt}>
            <div className="cm-texts">
              {message.img && <img src={message.img} alt="" />}
              <p>
                 {message.text}
              </p>
              <span>1 min ago</span>
            </div>
          </div>
      ))}
         {
          img.url && <div className="message own">
              <div className="cm-texts">
                  <img src={img.url} alt="" />
               
              </div>
            </div>
        }

          <div ref={endRef}></div>
      </div>
      <div className="bottom">
          <div className="cb-icons">
            <label htmlFor="file">
              <img src="./img.png" alt="" />
            </label>
            <input type="file"  id = "file" style={{display : "none"}} onChange={handleImg}/>
            <img src="./camera.png" alt="" />
            <img src="./mic.png" alt="" />
          </div>
          <input type="text"
            value = {text} 
            placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message" : 'Type a message'}
            onChange={(e)=>setText(e.target.value)}
            disabled = {isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="emoji">
            <img src="./emoji.png" alt="" onClick={()=>setOpen(prev=>!prev)}/>
            <div className="picker">
              <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
            </div>  
          </div>
          <button className="sendButton" onClick={handleSend} disabled = {isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat;
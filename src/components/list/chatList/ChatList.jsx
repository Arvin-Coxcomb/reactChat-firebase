import React, { useEffect, useState } from 'react'
import "./chatList.css"
import AddUser from './addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {
  const [chats, setChats] = useState([]); //this contains the fetched other users(friends) from the database.
  const [addMode, setAddMode] = useState(false);
  const {changeChat,user,chatId} = useChatStore();
  const [input, setInput] = useState("");

  const {currentUser} = useUserStore();

  useEffect(()=>{
    //onSnapshot is used to get the realtime updates from the database (i.e., the fetched data will be updated automatically when the data is changed in the database).
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      console.log(currentUser);
      console.log("Current data: ", res.data());
      
      const items = res.data().chats;
      console.log(items);

      const promises = items.map(async (item) =>{
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return {...item,user};
      })

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a,b)=>b.updatedAt - a.updatedAt));
      console.log(chatData);

  });

  return ()=>{
    unSub();  
  }
  },[currentUser.id])

  const handleSelect = async (chat) =>{

      const userChats = chats.map((item)=>{
        const {user, ...rest} = item;
        return rest;
      })

      const chatIndex = userChats.findIndex((item)=>item.chatId === chat.chatId);

      userChats[chatIndex].isSeen = true;

      const userChatsRef = doc(db, "userchats", currentUser.id);

      try{
        await updateDoc(userChatsRef, {
          chats : userChats,
        })

        changeChat(chat.chatId,chat.user);

      }catch(err){
        console.log(err);
      }
  }
  console.log(chatId,user);

    const filteredChatList = chats.filter((c)=>c.user.username.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className='chatList'>
      <div className="search">
        <div className="search-bar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder='Search' onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img src= {addMode ? "./minus.png" : "./plus.png" } alt="" className='add' onClick = {()=> setAddMode(prev => !prev)} />
      </div>
      {filteredChatList.map((chat)=>(
        <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)}
        style={{backgroundColor : chat?.isSeen ? "transparent" : "#5183fe"}}
        >
        <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
        <div className="texts">
          <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
          <p>{chat.lastMessage}</p>
        </div>
      </div>
      ))}
      
      {addMode && <AddUser />}
    </div>
  )
}

export default ChatList
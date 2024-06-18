import React from 'react'
import "./detail.css";
import { auth, db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

const Detail = () => {
  const {chatId, user, isReceiverBlocked, isCurrentUserBlocked, changeBlock} = useChatStore();
  const {currentUser} = useUserStore();


  const handleBlock = async () =>{
     if(!user) return;
    
     const userRef = doc(db, "users", currentUser.id)
     try{

      await updateDoc(userRef,{
        blocked : isReceiverBlocked ? arrayRemove(user.id): arrayUnion(user.id)
      })

      changeBlock()

     }catch(err){
      console.log(err);
     }
      
  }

  return (
    <div className='detail'>
      <div className="d-user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet </p>
      </div>

      <div className="d-info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy % help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./favicon.png" alt="" />
                <span>img_2024_1.png</span>
              </div>
                <img src="./download.png" alt="" className='dload-icon'/>
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./favicon.png" alt="" />
                <span>img_2024_1.png</span>
              </div>
                <img src="./download.png" alt="" className='dload-icon'/>
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={()=>handleBlock()}>{isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "User blocked" : "Block"}</button>
        <button className='logout' onClick={()=>auth.signOut()}>Logout</button>

      </div>
      
    </div>
  )
}

export default Detail
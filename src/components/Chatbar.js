import React, { useEffect, useState } from "react";
import { BsImages, BsEmojiHeartEyesFill } from "react-icons/bs";
import { FiSend } from "react-icons/fi";
import { MdCall } from "react-icons/md";
import { FaVideo } from "react-icons/fa";
import { BiBlock } from "react-icons/bi";
import { useSelector } from "react-redux";
import moment from "moment";
import { getAuth, deleteUser, updateProfile, signOut } from "firebase/auth";
import { getDatabase, ref as refer, set, onValue, push, remove } from "firebase/database";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Chatbar = () => {
  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();
  let [sendBtn, setSendBtn] = useState(true);
  let [msg, setMsg] = useState("");
  let [msgData, setMsgData] = useState([]);
  // redux
  const receiverInfo = useSelector((info) => info.userSelection);

  let handleSendMsg = (e) => {
    setMsg(e.target.value);
    setSendBtn(false);
  };

  // Handle Send Msg
  let handleMsgSend = () => {
    set(push(refer(db, "messages/")), {
      data: msg,
      type: "text",
      timeStamp: Date(),
      senderUid: auth.currentUser.uid,
      senderName: auth.currentUser.displayName,
      senderPhoto: auth.currentUser.photoURL,
      receiverUid: receiverInfo.uid,
      receiverName: receiverInfo.name,
      receiverPhoto: receiverInfo.photo,
      idType: receiverInfo.id,
    });
    setMsg("");
  };

  // Handle Read Msg
  useEffect(() => {
    const msgRef = refer(db, "messages/");
    onValue(msgRef, (snapshot) => {
      let msgArr = [];
      snapshot.forEach((msgs) => {
        let msgInfo = {
          ...msgs.val(),
          id: msgs.key,
        };
        msgArr.push(msgInfo);
      });
      setMsgData(msgArr);
    });
  }, []);

  // Handle Images Send

  let handleImgSend = (e) => {
    // Storage Variable
    const storageRef = ref(storage, `Photo/${auth.currentUser.uid}/${e.target.files[0].name}`);
    const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);

    // Register three observers:
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // Handle unsuccessful uploads
        console.log(error.code);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Img upload link!
          set(push(refer(db, "messages/")), {
            data: downloadURL,
            type: "image",
            timeStamp: Date(),
            senderUid: auth.currentUser.uid,
            senderName: auth.currentUser.displayName,
            senderPhoto: auth.currentUser.photoURL,
            receiverUid: receiverInfo.uid,
            receiverName: receiverInfo.name,
            receiverPhoto: receiverInfo.photo,
          });
          setMsg("");
        });
      }
    );
  };

  return (
    <main id="chatbar">
      {/* Header */}
      <header id="header">
        <div className="header__user">
          <img src={receiverInfo.photo} />
          <div className="header__user__details">
            <h1>{receiverInfo.name}</h1>
            <p>Online</p>
          </div>
        </div>
        <div className="header__more">
          <button>
            <MdCall />
          </button>
          <button>
            <FaVideo />
          </button>
          <button>
            <BiBlock />
          </button>
        </div>
      </header>
      {/* Messages Box */}
      <section id="messages">
        <div className="messages">
          {msgData.map((msg) =>
            msg.idType == "group" ? (
              msg.receiverUid == receiverInfo.uid ? (
                <div key={msg.id} className="messages_box">
                  <div style={msg.senderUid == auth.currentUser.uid ? msgSenderStyle : msgReceiverStyle} className="messages__text">
                    <img src={msg.senderPhoto} />
                    {msg.type == "text" ? <p style={msg.senderUid == auth.currentUser.uid ? msgParaSender : msgParaReceiver}>{msg.data}</p> : <img className="chat_img" src={msg.data} />}
                  </div>
                  <h6 style={msg.senderUid == auth.currentUser.uid ? senderTime : receiverTime}>
                    <strong>{msg.idType == "group" ? msg.senderName : ""} &bull;</strong> {moment(msg.timeStamp).fromNow()}
                  </h6>
                </div>
              ) : (
                ""
              )
            ) : msg.receiverUid == receiverInfo.uid || msg.senderUid == receiverInfo.uid ? (
              <div key={msg.id} className="messages_box">
                <div style={msg.senderUid == auth.currentUser.uid ? msgSenderStyle : msgReceiverStyle} className="messages__text">
                  <img src={auth.currentUser.uid == msg.senderUid ? auth.currentUser.photoURL : receiverInfo.photo} />
                  {msg.type == "text" ? <p style={msg.senderUid == auth.currentUser.uid ? msgParaSender : msgParaReceiver}>{msg.data}</p> : <img className="chat_img" src={msg.data} />}
                </div>
                <h6 style={msg.senderUid == auth.currentUser.uid ? senderTime : receiverTime}>{moment(msg.timeStamp).fromNow()}</h6>
              </div>
            ) : (
              ""
            )
          )}
        </div>
      </section>
      {/* Footer */}
      <footer id="footer">
        <div className="footer__files">
          <button>
            <BsImages />
          </button>
          <div className="footer_file">
            <input onChange={handleImgSend} type="file" />
          </div>
        </div>
        <div className="footer__input">
          <input onChange={handleSendMsg} value={msg} type="text" placeholder="Aa" />
        </div>
        <div className="footer__emoji">
          {sendBtn ? (
            <button>
              <BsEmojiHeartEyesFill />
            </button>
          ) : (
            <button onClick={handleMsgSend}>
              <FiSend />
            </button>
          )}
        </div>
      </footer>
    </main>
  );
};

let msgReceiverStyle = {
  justifyContent: "start",
  marginRight: "auto",
};

let msgSenderStyle = {
  justifyContent: "end",
  marginLeft: "auto",
};

let msgParaSender = {
  background: "#6358dc",
  color: "#ffffff",
};

let msgParaReceiver = {
  background: "#e5e5e5",
};

let receiverTime = {
  left: "42px",
};

let senderTime = {
  right: "0",
};

export default Chatbar;

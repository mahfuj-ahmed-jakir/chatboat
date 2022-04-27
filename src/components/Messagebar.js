import React, { useEffect, useState } from "react";
import { MdOutlineCreate, MdEmail } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { IoMdCheckmark, IoMdClose, IoMdAdd } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAuth, deleteUser, updateProfile, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as refer, set, onValue, push, remove } from "firebase/database";

const Messagebar = () => {
  let [searchBox, setSearchBox] = useState(true);
  let [friendsListBox, setFriendsListBox] = useState(true);
  let [reqBox, setReqBox] = useState(true);
  let [friendsAddedListBox, setFriendsAddedListBox] = useState(true);
  let [groupInputBox, SetGroupInputBox] = useState(false);
  let [groupListBox, SetGroupListBox] = useState(true);
  let [groupTitleBox, setGroupTitleBox] = useState(true);
  let [profileBox, setProfileBox] = useState(false);
  let [pro, setPro] = useState(true);
  // React Router DOM
  const navigate = useNavigate();
  // Firebase
  const auth = getAuth();
  const storage = getStorage();
  const db = getDatabase();
  // Redux
  const dispatch = useDispatch();

  let handleGroupBox = () => {
    SetGroupInputBox(true);
    SetGroupListBox(true);
    setGroupTitleBox(true);
    setSearchBox(false);
    setFriendsListBox(false);
    setReqBox(false);
    setFriendsAddedListBox(false);
    setProfileBox(false);
  };

  let handleFriendsReqAddBox = () => {
    setSearchBox(true);
    setReqBox(true);
    setFriendsAddedListBox(true);
    SetGroupInputBox(false);
    SetGroupListBox(false);
    setGroupTitleBox(false);
    setFriendsListBox(false);
    setProfileBox(false);
  };

  let handleAllFriendsBox = () => {
    setProfileBox(false);
    SetGroupInputBox(false);
    setSearchBox(true);
    setReqBox(true);
    setFriendsAddedListBox(true);
    SetGroupListBox(true);
    setGroupTitleBox(true);
    setFriendsListBox(true);
  };

  let handleProfileSetting = () => {
    SetGroupInputBox(false);
    setSearchBox(false);
    setReqBox(false);
    setFriendsAddedListBox(false);
    SetGroupListBox(false);
    setGroupTitleBox(false);
    setFriendsListBox(false);
    setProfileBox(true);
  };

  // Group Member list
  let [grpMemberList, setGrpMemberList] = useState(false);
  let handleGrpMemberList = () => {
    setGrpMemberList(!grpMemberList);
  };

  // Handle User Delete
  let handleUserDelete = () => {
    deleteUser(auth.currentUser)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        // An error ocurred
        console.log(error.code);
      });
  };

  // Handle User Log Out
  let handleUserLogOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate("/login");
      })
      .catch((error) => {
        console.log(error.code);
      });
  };

  // Handle Profile Update
  let [profileEditBtn, setProfileEditBtn] = useState(false);
  let [profileUpdateName, setProfileUpdateName] = useState("");
  let [profileUpdateImg, setProfileUpdateImg] = useState("");
  let [profileUpdateErr, setProfileUpdateErr] = useState("");

  let handleProfileName = () => {
    setProfileEditBtn(true);
  };

  let handleProfileNameInput = (e) => {
    setProfileUpdateName(e.target.value);
  };

  let handleProfileFileInput = (e) => {
    setProfileUpdateImg(e.target.files[0]);
  };

  let handleProfileUpdate = () => {
    if (profileUpdateName == "") {
      setProfileUpdateErr("Enter your name.");
    } else if (profileUpdateImg == "") {
      setProfileUpdateErr("Choose a photo.");
    } else {
      // Storage Variable
      const storageRef = ref(storage, `Profile Picture/${auth.currentUser.uid}/${profileUpdateImg.name}`);
      const uploadTask = uploadBytesResumable(storageRef, profileUpdateImg);

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
            updateProfile(auth.currentUser, {
              displayName: profileUpdateName,
              photoURL: downloadURL,
            })
              .then(() => {
                // Profile updated!
                set(refer(db, `users/${auth.currentUser.uid}`), {
                  username: auth.currentUser.displayName,
                  email: auth.currentUser.email,
                  photoURL: auth.currentUser.photoURL,
                  uid: auth.currentUser.uid,
                });
                setProfileUpdateErr("Profile changed!");
              })
              .catch((error) => {
                // An error occurred
                console.log(error.code);
              });
          });
        }
      );
    }
  };

  // Handle Public user added
  let [addedUsers, setAddedUsers] = useState([]);

  useEffect(() => {
    const addedRef = refer(db, "users/");
    onValue(addedRef, (snapshot) => {
      let addedArry = [];
      snapshot.forEach((added) => {
        if (added.key !== auth.currentUser.uid) {
          let addedData = {
            ...added.val(),
            id: added.key,
          };
          addedArry.push(addedData);
        }
      });
      setAddedUsers(addedArry);
    });
  }, []);

  // Handle User Add
  let handlePublicAdd = (uid, name, photoUrl) => {
    set(push(refer(db, "added/")), {
      senderUid: auth.currentUser.uid,
      senderName: auth.currentUser.displayName,
      senderPhotoUrl: auth.currentUser.photoURL,
      receiverUid: uid,
      receiverName: name,
      receiverPhotoUrl: photoUrl,
    });
  };

  // Handle friends request added
  let [reqUsers, setReqUsers] = useState([]);

  useEffect(() => {
    const reqRef = refer(db, "added/");
    onValue(reqRef, (snapshot) => {
      let reqArry = [];
      snapshot.forEach((req) => {
        let reqData = {
          ...req.val(),
          id: req.key,
        };
        reqArry.push(reqData);
      });
      setReqUsers(reqArry);
    });
  }, []);

  // Handle Accept Request
  let handleAcceptReq = (uid, name, photoUrl, id) => {
    set(push(refer(db, "friends/")), {
      acceptUid: auth.currentUser.uid,
      acceptName: auth.currentUser.displayName,
      acceptPhotoUrl: auth.currentUser.photoURL,
      acceptStatus: true,
      acceptBlock: false,
      requestUid: uid,
      requestName: name,
      requestPhotoUrl: photoUrl,
      requestStatus: true,
      requestBlock: false,
    });

    const reqDeleteRef = refer(db, `added/${id}`);
    remove(reqDeleteRef);
  };

  // Handle Req Delete
  let handleReqDelete = (id) => {
    const reqDeleteRef = refer(db, `added/${id}`);
    remove(reqDeleteRef);
  };

  // Handle friends
  let [msgUsers, setMsgUsers] = useState([]);

  useEffect(() => {
    const friendsRef = refer(db, "friends/");
    onValue(friendsRef, (snapshot) => {
      let friendsArry = [];
      snapshot.forEach((friends) => {
        let friendsData = {
          ...friends.val(),
          id: friends.key,
        };
        friendsArry.push(friendsData);
      });
      setMsgUsers(friendsArry);
    });
  }, []);

  // Story Added
  let handleStoryAdd = (e) => {
    // Storage Variable
    const storageRef = ref(storage, `Story/${auth.currentUser.uid}/${e.target.files[0].name}`);
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
          set(refer(db, `story/${auth.currentUser.uid}`), {
            name: auth.currentUser.displayName,
            storyUrl: downloadURL,
          });
        });
      }
    );
  };

  // Get Story Imgages
  let [storyImages, setStoryImages] = useState([]);

  useEffect(() => {
    const storyRef = refer(db, "story/");
    onValue(storyRef, (snapshot) => {
      let storyArry = [];
      snapshot.forEach((story) => {
        let storyData = {
          ...story.val(),
          id: story.key,
        };
        storyArry.push(storyData);
      });
      setStoryImages(storyArry);
    });
  }, []);

  // Handle User Selection
  let [activeUser, setActiveUser] = useState("");

  let handleUserSelect = (uid, name, photo, block, id) => {
    setActiveUser(uid);
    dispatch({ type: "SELECT_USERS", payload: { uid: uid, name: name, photo: photo, block: block, id: id } });
  };

  // Handle Group Create
  let [groupName, setGroupName] = useState("");

  let handleGroupInput = (e) => {
    setGroupName(e.target.value);
  };

  let handleGroupCreate = () => {
    // Group details control
    set(push(refer(db, "group/")), {
      groupName: groupName,
      groupIcon: "https://cdn-icons-png.flaticon.com/512/166/166258.png",
      adminUid: auth.currentUser.uid,
      adminName: auth.currentUser.displayName,
      adminPhoto: auth.currentUser.photoURL,
    });

    setGroupName("");
  };

  // Read Group List

  let [groupList, setGroupList] = useState([]);

  useEffect(() => {
    const groupListRef = refer(db, "group/");
    onValue(groupListRef, (snapshot) => {
      let groupListArry = [];
      snapshot.forEach((groupList) => {
        let groupListData = {
          ...groupList.val(),
          id: groupList.key,
        };
        groupListArry.push(groupListData);
      });
      setGroupList(groupListArry);
    });
  }, []);

  // Handle Group Member Added
  let handleGrpUsersAdd = (uid, name, photo, id) => {
    set(refer(db, `group/${id}/member/${uid}`), {
      name: name,
      icon: photo,
      groupId: id,
    });
  };

  // Group Added member list
  let [grpMemberData, setGrpMemberData] = useState([]);

  useEffect(() => {
    const groupMemListRef = refer(db, `group/${activeUser}/member/`);
    onValue(groupMemListRef, (snapshot) => {
      let grpMemberlst = [];
      snapshot.forEach((groupList) => {
        let groupListData = {
          ...groupList.val(),
          id: groupList.key,
        };
        grpMemberlst.push(groupListData);
      });
      setGrpMemberData(grpMemberlst);
    });
  }, [activeUser]);

  // Handle Group Message Send
  let handleGropMsg = (uid, name, photo) => {
    setActiveUser(uid);
    dispatch({ type: "SELECT_USERS", payload: { uid: uid, name: name, photo: photo, block: false, id: "group" } });
  };

  return (
    <main id="messagebar">
      <div className="messagebar">
        {/* Header Bar */}
        <div className="messagesbar__header">
          <div className="messagesbar__header__user">
            <img onClick={handleProfileSetting} src={pro ? "https://d32ogoqmya1dw8.cloudfront.net/images/serc/empty_user_icon_256.v2.png" : auth.currentUser.photoURL} />
            <div className="messagesbar__header__user__details">
              <h1>Chats</h1>
            </div>
          </div>
          <div className="messagesbar__header__more">
            <button onClick={handleAllFriendsBox}>
              <FaUserFriends />
            </button>
            <button onClick={handleFriendsReqAddBox}>
              <AiOutlineMessage />
            </button>
            <button onClick={handleGroupBox}>
              <MdOutlineCreate />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchBox ? (
          <div className="searchbar">
            <FiSearch />
            <input type="text" placeholder="Search" />
          </div>
        ) : (
          ""
        )}

        <main id="messagesbar_scroll">
          {/* Profile Setting */}
          {profileBox ? (
            <div id="profile">
              <div className="profile">
                <div className="profile_img">
                  <img src={auth.currentUser.photoURL} alt="Chatboat" />
                  <div className="proileChangeIcon">
                    <input onChange={handleProfileFileInput} type="file" />
                  </div>
                </div>
                <div className="profile_details">
                  <div className="profile_details_name">
                    {profileEditBtn ? (
                      <input onChange={handleProfileNameInput} value={profileUpdateName} placeholder="New Name" type="text" />
                    ) : (
                      <>
                        <h1>{auth.currentUser.displayName}</h1>
                        <HiOutlinePencilAlt onClick={handleProfileName} />
                      </>
                    )}
                  </div>
                  <div className="profile_details_info">
                    <MdEmail />
                    <p>{auth.currentUser.email}</p>
                  </div>
                  <p className="profileErr">{profileUpdateErr}</p>
                  <button onClick={handleProfileUpdate}>Update</button>
                </div>
              </div>
              <button onClick={handleUserLogOut}>Log Out</button>
              <button onClick={handleUserDelete}>Delete Account</button>
            </div>
          ) : (
            ""
          )}

          {/* Friends Bar */}
          {friendsListBox ? (
            <div id="friendsbar">
              {/* Story Bar */}
              <p>Story</p>
              <div id="story">
                <div className="story">
                  <div className="story_add">
                    <IoMdAdd />
                    <div className="storyAddInput">
                      <input onChange={handleStoryAdd} type="file" />
                    </div>
                  </div>
                  {storyImages.map((storyImg) => (
                    <div key={storyImg.id} className="story_img">
                      <img src={storyImg.storyUrl} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Friends List */}
              <div id="friends_list">
                <p>Friends</p>
                {msgUsers.map((msg) =>
                  msg.acceptUid == auth.currentUser.uid || msg.requestUid == auth.currentUser.uid ? (
                    <div key={msg.id} onClick={() => handleUserSelect(msg.acceptUid == auth.currentUser.uid ? msg.requestUid : msg.acceptUid, msg.acceptUid == auth.currentUser.uid ? msg.requestName : msg.acceptName, msg.acceptUid == auth.currentUser.uid ? msg.requestPhotoUrl : msg.acceptPhotoUrl, msg.acceptUid == auth.currentUser.uid ? msg.requestBlock : msg.acceptBlock, msg.id)} style={activeUser == msg.acceptUid || activeUser == msg.requestUid ? activeCss : deactiveCss} className="friend">
                      <div className="friend__img">
                        <img src={msg.acceptUid == auth.currentUser.uid ? msg.requestPhotoUrl : msg.acceptPhotoUrl} alt="Chatboat Friends" />
                      </div>
                      <div className="friend__details">
                        <h1>{msg.acceptUid == auth.currentUser.uid ? msg.requestName : msg.acceptName}</h1>
                        <p></p>
                      </div>
                    </div>
                  ) : (
                    ""
                  )
                )}
              </div>
            </div>
          ) : (
            ""
          )}

          {/* Groups Bar */}
          <div id="friends_list">
            {groupTitleBox ? <p>Groups</p> : ""}
            {/* Search Bar */}
            {groupInputBox ? (
              <div id="group_input">
                <div className="searchbar">
                  <FiSearch />
                  <input value={groupName} onChange={handleGroupInput} type="text" placeholder="Group Name" />
                </div>
                <button onClick={handleGroupCreate}>Create</button>
              </div>
            ) : (
              ""
            )}
            {groupListBox ? (
              <>
                {groupList.map((data) => (
                  <div style={data.id == activeUser ? groupActiveCss : groupDeactiveCss} onClick={() => handleGropMsg(data.id, data.groupName, data.groupIcon)} key={data.id}>
                    <div className="friend">
                      <div className="friend__img">
                        <img src={data.groupIcon} alt="Chatboat Friends" />
                      </div>
                      <div className="friend__details">
                        <h1>{data.groupName}</h1>
                        <p></p>
                      </div>
                      <div className="friends_add_btn">
                        <button onClick={handleGrpMemberList}>
                          <FiArrowRight />
                        </button>
                      </div>
                    </div>
                    {grpMemberList ? (
                      <>
                        <div id="friends_add">
                          <p style={{ margin: "0 0 0 10px" }}>Member</p>
                          <div className="friends_add">
                            <div className="friends_add_img">
                              <img src={data.adminPhoto} alt="Chatboat Friends" />
                            </div>
                            <div className="friends_add_name">
                              <h1>{data.adminName}</h1>
                              <p>Admin</p>
                            </div>
                            <div className="friends_add_btn"></div>
                          </div>
                          {grpMemberData.map((memData) =>
                            data.id == memData.groupId ? (
                              <div key={memData.id} className="friends_add">
                                <div className="friends_add_img">
                                  <img src={memData.icon} alt="Chatboat Friends" />
                                </div>
                                <div className="friends_add_name">
                                  <h1>{memData.name}</h1>
                                  <p>Added by Admin</p>
                                </div>
                                <div className="friends_add_btn"></div>
                              </div>
                            ) : (
                              ""
                            )
                          )}
                        </div>
                        <div id="friends_add">
                          <p style={{ margin: "10px 0 0 10px" }}>Add New</p>
                          {addedUsers.map((users) => (
                            <div key={users.id} className="friends_add">
                              <div className="friends_add_img">
                                <img src={users.photoURL} alt="Chatboat Friends" />
                              </div>
                              <div className="friends_add_name">
                                <h1>{users.username}</h1>
                              </div>
                              <div className="friends_add_btn">
                                <button onClick={() => handleGrpUsersAdd(users.uid, users.username, users.photoURL, data.id)}>
                                  <IoMdAdd />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </>
            ) : (
              ""
            )}
          </div>

          {/* Friends Request Accept Bar */}
          {reqBox ? (
            <div id="friends_req">
              <p>Request</p>
              {reqUsers.map((reqData) =>
                reqData.senderUid !== auth.currentUser.uid && reqData.receiverUid == auth.currentUser.uid ? (
                  <div key={reqData.id} className="friends_req">
                    <div className="friends_req_img">
                      <img src={reqData.senderPhotoUrl} alt="Chatboat Friends" />
                    </div>
                    <div className="friends_req_name">
                      <h1>{reqData.senderName}</h1>
                    </div>
                    <div className="friends_req_btn">
                      <button onClick={() => handleAcceptReq(reqData.senderUid, reqData.senderName, reqData.senderPhotoUrl, reqData.id)}>
                        <IoMdCheckmark />
                      </button>
                      <button onClick={() => handleReqDelete(reqData.id)}>
                        <IoMdClose />
                      </button>
                    </div>
                  </div>
                ) : (
                  ""
                )
              )}
            </div>
          ) : (
            ""
          )}

          {/* Friends Added Bar */}
          {friendsAddedListBox ? (
            <div id="friends_add">
              <p>Public</p>
              {addedUsers.map((addedData) => (
                <div key={addedData.id} className="friends_add">
                  <div className="friends_add_img">
                    <img src={addedData.photoURL} alt="Chatboat Friends" />
                  </div>
                  <div className="friends_add_name">
                    <h1>{addedData.username}</h1>
                  </div>
                  <div className="friends_add_btn">
                    <button onClick={() => handlePublicAdd(addedData.uid, addedData.username, addedData.photoURL)}>
                      <IoMdAdd />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
        </main>
      </div>
    </main>
  );
};

let activeCss = {
  background: "#e5e5e5",
};

let deactiveCss = {
  background: "#ffffff",
};

let groupDeactiveCss = {
  border: "1px solid #e5e5e5",
  marginBottom: "10px",
  borderRadius: "8px",
  background: "#ffffff",
};

let groupActiveCss = {
  border: "1px solid #e5e5e5",
  marginBottom: "10px",
  borderRadius: "8px",
  background: "#e5e5e5",
};

export default Messagebar;

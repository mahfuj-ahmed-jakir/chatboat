import React, { useState } from "react";
import SocialLogin from "../components/SocialLogin";
import loginImg from "../assets/images/loginImg.png";
import { Link, useNavigate } from "react-router-dom";
import firebaseConfig from "../firebaseConfig";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";

const Registration = () => {
  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();
  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [err, setErr] = useState("");

  let handleName = (e) => {
    setName(e.target.value);
  };

  let handleEmail = (e) => {
    setEmail(e.target.value);
  };

  let handlePassword = (e) => {
    setPassword(e.target.value);
  };

  let handleLoginBtn = (e) => {
    e.preventDefault();

    if (!name && !email && !password) {
      setErr("Fill the all details.");
    } else if (!name) {
      setErr("Enter your name.");
    } else if (!email) {
      setErr("Enter your email");
    } else if (!password) {
      setErr("Enter your password.");
    } else if (password.length < 8) {
      setErr("Enter strong password.");
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: "https://www.w3schools.com/howto/img_avatar2.png",
          }).then(() => {
            // Profile updated!
            sendEmailVerification(auth.currentUser);
            setErr("");
            setName("");
            setEmail("");
            setPassword("");
            // Realtime database
            set(ref(db, `users/${auth.currentUser.uid}`), {
              username: auth.currentUser.displayName,
              email: auth.currentUser.email,
              photoURL: auth.currentUser.photoURL,
              uid: auth.currentUser.uid,
            });
            navigate("/");
          });
        })
        .catch((error) => {
          if (error.code == "auth/email-already-in-use") {
            setErr("Email already in use");
          }
        });
    }
  };

  return (
    <main id="login">
      <div className="container">
        <div className="login">
          <div className="login__left">
            <img src={loginImg} alt="Chatboat Login" />
          </div>
          <div className="login__right">
            <div className="login__right__con">
              <h1>
                Welcome to
                <br />
                <span>Chatboat</span>
              </h1>
              <SocialLogin />
              <p>--------- &nbsp; &nbsp; OR &nbsp; &nbsp; ---------</p>
              <form>
                <input value={name} onChange={handleName} type="text" placeholder="Name" />
                <input value={email} onChange={handleEmail} type="email" placeholder="Email" />
                <input value={password} onChange={handlePassword} type="password" placeholder="Password" />
                <div className="login_rem_forgot">
                  <p>{err}</p>
                  <p></p>
                </div>
                <button onClick={handleLoginBtn}>Registration</button>
              </form>
              <p>
                You have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Registration;

import React, { useState } from "react";
import SocialLogin from "../components/SocialLogin";
import loginImg from "../assets/images/loginImg.png";
import { Link, useNavigate } from "react-router-dom";
import firebaseConfig from "../firebaseConfig";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const Login = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [err, setErr] = useState("");
  let [forgotLayout, setForgotLayout] = useState(true);

  let handleEmail = (e) => {
    setEmail(e.target.value);
  };

  let handlePassword = (e) => {
    setPassword(e.target.value);
  };

  let handleLoginBtn = (e) => {
    e.preventDefault();

    if (!email && !password) {
      setErr("Enter your name.");
    } else if (!email) {
      setErr("Enter your email");
    } else if (!password) {
      setErr("Enter your password.");
    } else if (password.length < 8) {
      setErr("Wrong password.");
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          setErr("");
          setEmail("");
          setPassword("");
          navigate("/");
        })
        .catch((error) => {
          console.log(error.code);
          if (error.code == "auth/user-not-found") {
            setErr("Wrong email.");
          } else if (error.code == "auth/wrong-password") {
            setErr("Wrong password.");
          } else if (error.code == "auth/invalid-email") {
            setErr("Invalid email.");
          } else {
            setErr("");
          }
        });
    }
  };

  // Password reset setup
  let [resetEmail, setResetEmail] = useState("");
  let [resetEmailErr, setResetEmailErr] = useState("");

  let handleResetEmail = (e) => {
    setResetEmail(e.target.value);
  };

  let handlePasswordReset = (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetEmailErr("Enter your email.");
    } else {
      sendPasswordResetEmail(auth, resetEmail)
        .then(() => {
          setResetEmailErr("Check your email.");
          setResetEmail("");
        })
        .catch((error) => {
          console.log(error.code);
          if (error.code == "auth/invalid-email") {
            setResetEmailErr("Wrong email.");
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
          {forgotLayout ? (
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
                  <input value={email} onChange={handleEmail} type="email" placeholder="Email" />
                  <input value={password} onChange={handlePassword} type="password" placeholder="Password" />
                  <div className="login_rem_forgot">
                    <p>{err}</p>
                    <a onClick={() => setForgotLayout(!forgotLayout)}>Forgot Password?</a>
                  </div>
                  <button onClick={handleLoginBtn}>Login</button>
                </form>
                <p>
                  Don't have an account? <Link to="/registration">Registration</Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="login__right">
              <div className="login__right__con">
                <h1>
                  Welcome to
                  <br />
                  <span>Chatboat</span>
                </h1>
                <br />
                <form>
                  <input value={resetEmail} onChange={handleResetEmail} type="email" placeholder="Email" />
                  <div className="login_rem_forgot">
                    <p>{resetEmailErr}</p>
                    <a onClick={() => setForgotLayout(!forgotLayout)}>Login your account?</a>
                  </div>
                  <button onClick={handlePasswordReset}>Reset</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Login;

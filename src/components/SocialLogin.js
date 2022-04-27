import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

const SocialLogin = () => {
  const auth = getAuth();
  const db = getDatabase();
  const provider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();
  const navigate = useNavigate();

  let handleGoogleSignin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // Realtime database
        set(ref(db, `users/${auth.currentUser.uid}`), {
          username: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
          uid: auth.currentUser.uid,
        });
        navigate("/");
      })
      .catch((error) => {
        console.log(error.code);
      });
  };

  let handleFacebookSignin = () => {
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        // Realtime database
        set(ref(db, `users/${auth.currentUser.uid}`), {
          username: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
          uid: auth.currentUser.uid,
        });
        navigate("/");
      })
      .catch((error) => {
        console.log(error.code);
      });
  };

  return (
    <main id="social_login">
      <button onClick={handleGoogleSignin}>
        <FcGoogle /> &nbsp; Login with Google
      </button>
      <button onClick={handleFacebookSignin}>
        <FaFacebookF /> &nbsp; Login with Facebook
      </button>
    </main>
  );
};

export default SocialLogin;

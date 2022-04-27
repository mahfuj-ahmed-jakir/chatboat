import React from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Messagebar from "../components/Messagebar";
import Chatbar from "../components/Chatbar";

const Home = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      const uid = user.uid;
    } else {
      // User is sign out
      navigate("/login");
    }
  });

  return (
    <main id="home">
      <Messagebar />
      <Chatbar />
    </main>
  );
};

export default Home;

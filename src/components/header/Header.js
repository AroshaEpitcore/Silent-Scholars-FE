import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { FaChild } from "react-icons/fa";
import { auth } from '../../firebase'; // Import your Firebase auth
import { signOut } from 'firebase/auth'; // Import signOut function
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

export default function Header() {
  const { i18n } = useTranslation("common");
  const navigate = useNavigate(); // Initialize useNavigate
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  useEffect(() => {
    const currentLanguage = localStorage.getItem("i18nextLng") || "si"; // Default to "si"
    i18next.changeLanguage(currentLanguage);
  }, []);

  useEffect(() => {
    // Check user authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Update isLoggedIn state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("i18nextLng", e.target.value); // Update local storage
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout Error:', error.message);
    }
  };

  return (
    <>
      {/* navbar section */}
      <section className="navbar-section">
        <div className="container">
          <nav className="navbar navbar-light">
            <div className="container-fluid">
              <a className="navbar-brand py-4" href="#">
                Silent Scholars
                <FaChild color="white" />
              </a>
              <select
                className="form-select text-white"
                style={{ width: "10%", cursor: "pointer", backgroundColor: "#584FBF" }}
                value={localStorage.getItem("i18nextLng")}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="si">Sinhala</option>
              </select>
              {/* Conditionally render the logout button */}
              {isLoggedIn && (
                <button className="btn btn-danger ms-3" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}

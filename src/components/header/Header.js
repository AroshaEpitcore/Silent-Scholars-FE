import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { FaChild, FaUser, FaSignOutAlt } from "react-icons/fa";
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import "./header.css";

export default function Header() {
  const { i18n } = useTranslation("common");
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const currentLanguage = localStorage.getItem("i18nextLng") || "si";
    i18next.changeLanguage(currentLanguage);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("i18nextLng", e.target.value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error.message);
    }
  };

  return (
    <>
      <section className={`navbar-section ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <nav className="navbar navbar-light">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">
                Silent Scholars
                <FaChild />
              </Link>
              
              <div className="d-flex align-items-center gap-3">
                <select
                  className="form-select"
                  value={localStorage.getItem("i18nextLng")}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                </select>
                
                {isLoggedIn && (
                  <>
                    <Link className="btn btn-outline-light" to="/profile-settings">
                      <FaUser />
                      Profile
                    </Link>
                    <button className="btn btn-danger" onClick={handleLogout}>
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}

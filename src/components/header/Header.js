import React, { useState, useEffect, useRef } from "react";
import i18next from "i18next";
import {
  FaChild, FaUser, FaSignOutAlt, FaHome, FaBook,
  FaGamepad, FaShieldAlt, FaTrophy, FaChevronDown,
  FaBars, FaTimes, FaClock, FaCheckCircle, FaHistory,
  FaTrafficLight, FaPaw, FaBell, FaCog,
} from "react-icons/fa";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./header.css";

/* ── Nav tree ── */
const NAV = [
  {
    label: "Home",
    to: "/home",
    icon: <FaHome />,
  },
  {
    label: "Learn",
    icon: <FaBook />,
    children: [
      { label: "Static Signs",  to: "/learn-static-sign",   icon: <FaBook /> },
      { label: "Traffic Signs", to: "/traffic-signs",        icon: <FaTrafficLight /> },
      { label: "Animals",       to: "/dashboard-animals",    icon: <FaPaw /> },
    ],
  },
  {
    label: "Games",
    icon: <FaGamepad />,
    children: [
      { label: "Sign Game",   to: "/static-sign-game",      icon: <FaGamepad /> },
      { label: "Leaderboard", to: "/leaderboard",            icon: <FaTrophy /> },
    ],
  },
  {
    label: "Guardian",
    icon: <FaShieldAlt />,
    children: [
      { label: "Dashboard",     to: "/guardian-dashboard",      icon: <FaShieldAlt /> },
      { label: "Notifications", to: "/guardian-notifications",  icon: <FaBell /> },
      { label: "Settings",      to: "/guardian-settings",       icon: <FaCog /> },
    ],
  },
];

/* ── useOutsideClick hook ── */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

/* ── Dropdown nav item ── */
function NavDropdown({ item, location }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const active = item.children?.some(c => location.pathname === c.to);

  return (
    <div ref={ref} className={`hd-nav-item hd-nav-dropdown ${active ? "hd-nav-item--active" : ""}`}>
      <button className="hd-nav-btn" onClick={() => setOpen(o => !o)}>
        <span className="hd-nav-icon">{item.icon}</span>
        {item.label}
        <FaChevronDown className={`hd-chevron ${open ? "hd-chevron--open" : ""}`} />
      </button>
      {open && (
        <div className="hd-dropdown-panel">
          {item.children.map(child => (
            <Link
              key={child.to}
              to={child.to}
              className={`hd-dropdown-link ${location.pathname === child.to ? "hd-dropdown-link--active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="hd-dropdown-link-icon">{child.icon}</span>
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Activity dropdown (Most Recent + Pending) ── */
function ActivityDropdown({ recentItems, pendingItems }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const pendingCount = pendingItems.length;

  return (
    <div ref={ref} className="hd-activity-wrap">
      <button className="hd-activity-btn" onClick={() => setOpen(o => !o)}>
        <FaClock />
        <span>Activity</span>
        {pendingCount > 0 && (
          <span className="hd-activity-badge">{pendingCount}</span>
        )}
        <FaChevronDown className={`hd-chevron ${open ? "hd-chevron--open" : ""}`} />
      </button>

      {open && (
        <div className="hd-activity-panel">
          {/* Most Recent */}
          <div className="hd-activity-section">
            <div className="hd-activity-section-title">
              <FaHistory /> Most Recent
            </div>
            {recentItems.length === 0 ? (
              <div className="hd-activity-empty">No recent activity</div>
            ) : (
              recentItems.map((item, i) => (
                <div className="hd-activity-item" key={i}>
                  <span className={`hd-activity-dot hd-activity-dot--${item.type}`} />
                  <div className="hd-activity-item-body">
                    <span className="hd-activity-item-label">{item.label}</span>
                    <span className="hd-activity-item-time">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hd-activity-divider" />

          {/* Pending */}
          <div className="hd-activity-section">
            <div className="hd-activity-section-title">
              <FaCheckCircle /> Pending
            </div>
            {pendingItems.length === 0 ? (
              <div className="hd-activity-empty">All caught up!</div>
            ) : (
              pendingItems.map((item, i) => (
                <div className="hd-activity-item" key={i}>
                  <span className={`hd-activity-dot hd-activity-dot--pending`} />
                  <div className="hd-activity-item-body">
                    <span className="hd-activity-item-label">{item.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Header ── */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mobileSub, setMobileSub]     = useState(null); // which sub-menu is open
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("i18nextLng") || "si"
  );

  /* Static activity data — replace with Firestore queries as needed */
  const recentItems = [
    { label: "Practiced Letter A",     time: "2h ago",  type: "practice" },
    { label: "Completed Sign Game",    time: "1d ago",  type: "game"     },
    { label: "Learned Traffic Signs",  time: "3d ago",  type: "learn"    },
  ];
  const pendingItems = [
    { label: "Practice Letter C" },
    { label: "Complete Static Sign Quiz" },
  ];

  useEffect(() => {
    i18next.changeLanguage(currentLang);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setIsLoggedIn(!!user));
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); setMobileSub(null); }, [location.pathname]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    i18next.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err.message);
    }
  };

  return (
    <header className={`hd-header ${isScrolled ? "hd-header--scrolled" : ""}`}>
      <div className="hd-inner">

        {/* ── Brand ── */}
        <Link className="hd-brand" to="/">
          <span className="hd-brand-icon"><FaChild /></span>
          <span className="hd-brand-text">Silent<span>Scholars</span></span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hd-nav">
          {NAV.map(item =>
            item.to ? (
              <Link
                key={item.to}
                to={item.to}
                className={`hd-nav-item hd-nav-link ${location.pathname === item.to ? "hd-nav-item--active" : ""}`}
              >
                <span className="hd-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <NavDropdown key={item.label} item={item} location={location} />
            )
          )}
        </nav>

        {/* ── Desktop right actions ── */}
        <div className="hd-actions">
          {isLoggedIn && (
            <ActivityDropdown recentItems={recentItems} pendingItems={pendingItems} />
          )}

          {/* Language selector */}
          <select
            className="hd-lang-select"
            value={currentLang}
            onChange={handleLanguageChange}
          >
            <option value="en">EN</option>
            <option value="si">සිං</option>
          </select>

          {isLoggedIn && (
            <>
              <Link className="hd-btn hd-btn--ghost" to="/profile-settings">
                <FaUser /> Profile
              </Link>
              <button className="hd-btn hd-btn--danger" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="hd-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="hd-mobile-menu">
          {NAV.map(item =>
            item.to ? (
              <Link
                key={item.to}
                to={item.to}
                className={`hd-mobile-link ${location.pathname === item.to ? "hd-mobile-link--active" : ""}`}
              >
                <span className="hd-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="hd-mobile-group">
                <button
                  className="hd-mobile-group-btn"
                  onClick={() => setMobileSub(mobileSub === item.label ? null : item.label)}
                >
                  <span className="hd-nav-icon">{item.icon}</span>
                  {item.label}
                  <FaChevronDown
                    className={`hd-chevron ${mobileSub === item.label ? "hd-chevron--open" : ""}`}
                    style={{ marginLeft: "auto" }}
                  />
                </button>
                {mobileSub === item.label && (
                  <div className="hd-mobile-sub">
                    {item.children.map(child => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`hd-mobile-sub-link ${location.pathname === child.to ? "hd-mobile-link--active" : ""}`}
                      >
                        <span className="hd-nav-icon">{child.icon}</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {isLoggedIn && (
            <div className="hd-mobile-activity">
              {/* Most Recent section */}
              <div className="hd-activity-section-title" style={{ padding: "0.5rem 1rem 0.25rem" }}>
                <FaHistory /> Most Recent
              </div>
              {recentItems.map((item, i) => (
                <div className="hd-activity-item hd-mobile-activity-item" key={i}>
                  <span className={`hd-activity-dot hd-activity-dot--${item.type}`} />
                  <div className="hd-activity-item-body">
                    <span className="hd-activity-item-label">{item.label}</span>
                    <span className="hd-activity-item-time">{item.time}</span>
                  </div>
                </div>
              ))}

              <div className="hd-activity-divider" />

              {/* Pending section */}
              <div className="hd-activity-section-title" style={{ padding: "0.5rem 1rem 0.25rem" }}>
                <FaCheckCircle /> Pending
              </div>
              {pendingItems.map((item, i) => (
                <div className="hd-activity-item hd-mobile-activity-item" key={i}>
                  <span className="hd-activity-dot hd-activity-dot--pending" />
                  <div className="hd-activity-item-body">
                    <span className="hd-activity-item-label">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="hd-mobile-footer">
            <select
              className="hd-lang-select"
              value={currentLang}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
            </select>

            {isLoggedIn && (
              <>
                <Link className="hd-btn hd-btn--ghost" to="/profile-settings">
                  <FaUser /> Profile
                </Link>
                <button className="hd-btn hd-btn--danger" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

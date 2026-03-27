import React from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaPlay, FaRocket, FaUsers, FaAward, FaArrowRight,
  FaHandPaper, FaTrafficLight, FaPaw, FaFileAlt,
  FaGamepad, FaBrain, FaShieldAlt, FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import network from "../../images/network.png";

export default function Landing() {
  const { t } = useTranslation("common");

  const features = [
    {
      icon: <FaPaw />,
      title: "Animal Signs",
      desc: "Learn dynamic animal signs using hand gesture recognition with real-time AI feedback.",
      link: "/dashboard-animals",
      color: "#f093fb",
    },
    {
      icon: <FaTrafficLight />,
      title: "Traffic Signs",
      desc: "Recognize and learn traffic signs through AI-powered camera detection.",
      link: "/traffic-signs",
      color: "#4facfe",
    },
    {
      icon: <FaHandPaper />,
      title: "Static Signs",
      desc: "Master the alphabet and static hand signs with instant accuracy scoring.",
      link: "/learn-static-sign",
      color: "#43e97b",
    },
    {
      icon: <FaFileAlt />,
      title: "Text to Sign",
      desc: "Upload PDFs and convert text content into sign language word references instantly.",
      link: "/textSign",
      color: "#fa709a",
    },
  ];

  const steps = [
    { step: "01", icon: <FaBrain />, title: "Choose a Module", desc: "Pick from Animals, Traffic Signs, Static Signs, or Text to Sign." },
    { step: "02", icon: <FaHandPaper />, title: "Practice with AI", desc: "Use your camera — our AI recognizes your hand gestures in real time." },
    { step: "03", icon: <FaAward />, title: "Track Progress", desc: "Earn achievements and let guardians monitor your learning journey." },
  ];

  const stats = [
    { value: "4+", label: "Learning Modules" },
    { value: "10+", label: "Sign Categories" },
    { value: "AI", label: "Powered Detection" },
    { value: "100%", label: "Free to Use" },
  ];

  return (
    <>
      {/* ── Hero Section (existing, kept) ── */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
          <div className="gradient-overlay"></div>
        </div>

        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6 col-md-12 hero-content">
              <div className="hero-badge">
                <FaRocket className="badge-icon" />
                <span>{t("aiPoweredLearning")}</span>
              </div>
              <h1 className="hero-title">
                <span className="title-line-1">{t("ELearning")}</span>
                <span className="title-line-2">{t("Platform")}</span>
              </h1>
              <h2 className="hero-subtitle">{t("WelcometothefutureofClassroom")}</h2>
              <p className="hero-description">{t("empoweringIndividuals")}</p>
              <div className="hero-actions">
                <Link to="/home" className="btn btn-primary hero-btn">
                  <span>{t("Exploreteachingservice")}</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
                <button className="btn btn-outline hero-btn-outline">
                  <FaPlay className="btn-icon" />
                  <span>{t("watchDemo")}</span>
                </button>
              </div>
              <div className="trust-indicators">
                <div className="trust-item">
                  <FaAward className="trust-icon" />
                  <span>{t("trustedByEducators")}</span>
                </div>
                <div className="trust-item">
                  <FaUsers className="trust-icon" />
                  <span>{t("communityDriven")}</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12 hero-visual">
              <div className="hero-image-container">
                <img src={network} alt="AI Learning Platform" className="hero-main-image" />
                <div className="floating-element floating-card-1">
                  <div className="floating-card">
                    <FaUsers className="card-icon" />
                    <div className="card-content">
                      <div className="card-title">{t("liveLearning")}</div>
                      <div className="card-subtitle">{t("realTimeFeedback")}</div>
                    </div>
                  </div>
                </div>
                <div className="floating-element floating-card-2">
                  <div className="floating-card">
                    <FaRocket className="card-icon" />
                    <div className="card-content">
                      <div className="card-title">{t("aiPowered")}</div>
                      <div className="card-subtitle">{t("smartRecognition")}</div>
                    </div>
                  </div>
                </div>
                <div className="floating-element floating-card-3">
                  <div className="floating-card">
                    <FaAward className="card-icon" />
                    <div className="card-content">
                      <div className="card-title">{t("certified")}</div>
                      <div className="card-subtitle">{t("expertApproved")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-text">{t("scrollToExplore")}</div>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="ln-stats-section">
        <div className="container">
          <div className="ln-stats-grid">
            {stats.map((s, i) => (
              <div className="ln-stat-card" key={i}>
                <div className="ln-stat-value">{s.value}</div>
                <div className="ln-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Section (existing, kept) ── */}
      <section className="content-section">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6 col-md-12 mb-5 mb-lg-0">
              <img
                src="https://c.tenor.com/xv9zebVwMMcAAAAC/no-yes.gif"
                alt="Interactive Learning"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <div className="col-lg-6 col-md-12">
              <h1 className="fw-bold">{t("welcome")}</h1>
              <br />
              <h2>
                <span className="font-link-2">{t("BESTSIGNLANGUAGE")}</span>
                <br />
                <span style={{ color: "var(--text-secondary)", fontSize: "1.5rem" }}>
                  {t("ELearningplatform")}
                </span>
              </h2>
              <p className="mt-4">{t("joinThousandsLearners")}</p>
              <Link to="/home">
                <button className="btn btn-primary">{t("Getstarted")}</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="ln-features-section">
        <div className="container">
          <div className="ln-section-header">
            <span className="ln-section-badge"><FaStar /> What We Offer</span>
            <h2 className="ln-section-title">Learn Sign Language <span>Your Way</span></h2>
            <p className="ln-section-sub">Four powerful modules powered by AI to make sign language learning interactive and fun.</p>
          </div>
          <div className="ln-features-grid">
            {features.map((f, i) => (
              <div className="ln-feature-card" key={i} style={{ "--fc": f.color }}>
                <div className="ln-feature-icon">{f.icon}</div>
                <h3 className="ln-feature-title">{f.title}</h3>
                <p className="ln-feature-desc">{f.desc}</p>
                <Link to={f.link} className="ln-feature-link">
                  Start Learning <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="ln-how-section">
        <div className="container">
          <div className="ln-section-header">
            <span className="ln-section-badge"><FaCheckCircle /> Simple Process</span>
            <h2 className="ln-section-title">How It <span>Works</span></h2>
            <p className="ln-section-sub">Get started in minutes — no prior experience needed.</p>
          </div>
          <div className="ln-steps-grid">
            {steps.map((s, i) => (
              <div className="ln-step-card" key={i}>
                <div className="ln-step-number">{s.step}</div>
                <div className="ln-step-icon">{s.icon}</div>
                <h3 className="ln-step-title">{s.title}</h3>
                <p className="ln-step-desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="ln-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guardian Section ── */}
      <section className="ln-guardian-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <span className="ln-section-badge ln-badge-light"><FaShieldAlt /> For Parents & Teachers</span>
              <h2 className="ln-guardian-title">Guardian <span>Dashboard</span></h2>
              <p className="ln-guardian-desc">
                Monitor your child's or student's learning progress in real time.
                Get activity reports, achievement alerts, and performance insights — all in one place.
              </p>
              <ul className="ln-guardian-list">
                <li><FaCheckCircle /> Track daily learning activity</li>
                <li><FaCheckCircle /> View scores and achievements</li>
                <li><FaCheckCircle /> Receive progress notifications</li>
                <li><FaCheckCircle /> Set learning goals</li>
              </ul>
              <Link to="/guardian-dashboard" className="ln-guardian-btn">
                Go to Guardian Dashboard <FaArrowRight />
              </Link>
            </div>
            <div className="col-lg-6">
              <div className="ln-guardian-visual">
                <div className="ln-guardian-card">
                  <div className="ln-gcard-header"><FaShieldAlt /> Guardian Overview</div>
                  <div className="ln-gcard-row"><span>Animal Signs</span><span className="ln-gcard-bar"><span style={{width:"80%"}}></span></span><b>80%</b></div>
                  <div className="ln-gcard-row"><span>Traffic Signs</span><span className="ln-gcard-bar"><span style={{width:"65%"}}></span></span><b>65%</b></div>
                  <div className="ln-gcard-row"><span>Static Signs</span><span className="ln-gcard-bar"><span style={{width:"90%"}}></span></span><b>90%</b></div>
                  <div className="ln-gcard-row"><span>Text to Sign</span><span className="ln-gcard-bar"><span style={{width:"45%"}}></span></span><b>45%</b></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="ln-cta-section">
        <div className="container">
          <div className="ln-cta-box">
            <div className="ln-cta-icon"><FaRocket /></div>
            <h2 className="ln-cta-title">Ready to Start Learning?</h2>
            <p className="ln-cta-sub">Join Silent Scholars and master sign language with the power of AI.</p>
            <div className="ln-cta-actions">
              <Link to="/register" className="ln-cta-btn-primary">Get Started Free <FaArrowRight /></Link>
              <Link to="/home" className="ln-cta-btn-outline">Explore Modules</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

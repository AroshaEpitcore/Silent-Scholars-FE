import React from "react";
import './dashboard.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardDetails } from '../../../Data/StaticSignDashboardData';
import { FaGraduationCap, FaGamepad, FaTrophy, FaHandPaper } from 'react-icons/fa';

export default function StaticSignDashboard() {
  const { t } = useTranslation("common");

  const staticSignServices = [
    {
      id: 1,
      title: "Learn",
      description: t('learnStaticSignDescription'),
      image: DashboardDetails[0]?.image,
      link: DashboardDetails[0]?.link || "/learn-static-sign",
      icon: <FaGraduationCap />,
      stripe: "ssd-card-stripe--primary",
      iconCls: "ssd-card-icon--primary",
      btnCls:  "ssd-card-btn--primary",
    },
    {
      id: 2,
      title: "Practice",
      description: t('practiceStaticSignDescription'),
      image: DashboardDetails[1]?.image,
      link: DashboardDetails[1]?.link || "/static-sign-game",
      icon: <FaGamepad />,
      stripe: "ssd-card-stripe--accent",
      iconCls: "ssd-card-icon--accent",
      btnCls:  "ssd-card-btn--accent",
    },
    {
      id: 3,
      title: "Leaderboard",
      description: t('leaderboardDescription'),
      image: DashboardDetails[2]?.image,
      link: DashboardDetails[2]?.link || "/leaderboard",
      icon: <FaTrophy />,
      stripe: "ssd-card-stripe--warning",
      iconCls: "ssd-card-icon--warning",
      btnCls:  "ssd-card-btn--warning",
    },
  ];

  return (
    <div className="ssd-page">
      <div className="ssd-container">

        {/* ── Hero banner ── */}
        <div className="ssd-hero">
          <div className="ssd-hero-icon">
            <FaHandPaper />
          </div>
          <h1>
            <span>{t("Static")}</span> Sign Language
          </h1>
          <p>
            Learn, practice and master static hand signs for the alphabet.
            Track your progress and compete on the leaderboard.
          </p>
        </div>

        {/* ── 3-column card grid ── */}
        <div className="ssd-grid">
          {staticSignServices.map((service) => (
            <div className="ssd-card" key={service.id}>
              <div className={`ssd-card-stripe ${service.stripe}`} />

              <div className="ssd-card-img">
                <img src={service.image} alt={service.title} />
              </div>

              <div className="ssd-card-body">
                <div className="ssd-card-title-row">
                  <div className={`ssd-card-icon ${service.iconCls}`}>
                    {service.icon}
                  </div>
                  <h3 className="ssd-card-title">{t(service.title)}</h3>
                </div>

                <p className="ssd-card-desc">{service.description}</p>

                <Link to={service.link} className={`ssd-card-btn ${service.btnCls}`}>
                  {t("LearnMore")} →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

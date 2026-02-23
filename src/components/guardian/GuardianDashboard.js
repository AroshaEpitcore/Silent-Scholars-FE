// src/components/guardian/GuardianDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GuardianDataService from "../../services/GuardianDataService";
import "./guardian-dashboard.css";
import {
  FaTrophy,
  FaChartLine,
  FaClock,
  FaLightbulb,
  FaBullseye,
  FaBell,
  FaCog,
  FaDownload,
  FaCalendarAlt,
  FaGraduationCap,
  FaGamepad,
  FaHandPaper,
  FaCar,
  FaBook,
  FaSync,
} from "react-icons/fa";

const GuardianDashboard = () => {
  const [data, setData] = useState({
    childInfo: null,
    performanceOverview: null,
    categoryProgress: [],
    recentActivities: [],
    achievements: [],
    recommendations: [],
    learningGoals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        childInfo,
        performanceOverview,
        categoryProgress,
        recentActivities,
        achievements,
        recommendations,
        learningGoals,
      ] = await Promise.all([
        GuardianDataService.getChildInfo(),
        GuardianDataService.getPerformanceOverview(),
        GuardianDataService.getCategoryProgress(),
        GuardianDataService.getRecentActivities(),
        GuardianDataService.getAchievements(),
        GuardianDataService.getRecommendations(),
        GuardianDataService.getLearningGoals(),
      ]);
      setData({ childInfo, performanceOverview, categoryProgress, recentActivities, achievements, recommendations, learningGoals });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Animal Signs":  return <FaHandPaper />;
      case "Static Signs":  return <FaGamepad />;
      case "Text to Sign":  return <FaBook />;
      case "Traffic Signs": return <FaCar />;
      default:              return <FaGraduationCap />;
    }
  };

  const calcPct = (completed, total) =>
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const fmtDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.childInfo?.name || "student"}-progress-report.json`;
    a.click();
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-container">
          <div className="gd-alert gd-alert-danger">
            <strong>Error:</strong> {error}
            <button className="gd-btn gd-btn-primary ms-3" onClick={loadDashboardData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── No data ── */
  if (!data.childInfo) {
    return (
      <div className="guardian-dashboard">
        <div className="gd-container">
          <div className="gd-alert gd-alert-warning">
            No learning data found. Start learning to see your progress!
          </div>
        </div>
      </div>
    );
  }

  const perf = data.performanceOverview || {};
  const child = data.childInfo;

  return (
    <div className="guardian-dashboard">
      <div className="gd-container">

        {/* ── Header ── */}
        <div className="gd-header">
          <div className="gd-header-title">
            <h1>Guardian Dashboard</h1>
            <p>Monitoring {child.name}'s learning progress</p>
          </div>
          <div className="gd-header-actions">
            <button className="gd-btn gd-btn-primary" onClick={loadDashboardData}>
              <FaSync /> Refresh
            </button>
            <button className="gd-btn gd-btn-outline" onClick={exportData}>
              <FaDownload /> Export
            </button>
            <Link to="/guardian-notifications" className="gd-btn gd-btn-outline">
              <FaBell /> Alerts
            </Link>
            <Link to="/guardian-settings" className="gd-btn gd-btn-outline">
              <FaCog /> Settings
            </Link>
          </div>
        </div>

        {/* ── Row 1: Profile + Performance ── */}
        <div className="gd-grid-top">

          {/* Profile card */}
          <div className="gd-card">
            <div className="gd-card-header"><FaGraduationCap /> Student Profile</div>
            <div className="gd-card-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={child.avatar || "/images/default-avatar.jpg"}
                  alt={child.name}
                  className="gd-profile-avatar"
                />
                <div className="gd-profile-info">
                  <h3>{child.name}</h3>
                  <p>
                    {child.age !== "Not specified" ? `Age ${child.age}` : ""}
                    {child.grade !== "Not specified" ? ` · ${child.grade}` : ""}
                  </p>
                  <p>Since {fmtDate(child.joinDate)}</p>
                </div>
              </div>
              <div className="gd-mini-stats">
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{child.totalLearningTime || "0h 0m"}</div>
                  <div className="gd-mini-stat-label">Learning Time</div>
                </div>
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{child.currentStreak || 0}</div>
                  <div className="gd-mini-stat-label">Day Streak</div>
                </div>
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{perf.lessonsCompleted || 0}</div>
                  <div className="gd-mini-stat-label">Lessons Done</div>
                </div>
                <div className="gd-mini-stat">
                  <div className="gd-mini-stat-value">{perf.averageScore || 0}%</div>
                  <div className="gd-mini-stat-label">Avg Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance overview */}
          <div className="gd-card">
            <div className="gd-card-header"><FaChartLine /> Performance Overview</div>
            <div className="gd-card-body">
              <div className="gd-perf-grid">
                <div className="gd-perf-card gd-perf-card--primary">
                  <div className="gd-perf-value">{perf.totalScore || 0}</div>
                  <div className="gd-perf-label">Total Score</div>
                </div>
                <div className="gd-perf-card gd-perf-card--accent">
                  <div className="gd-perf-value">{perf.averageScore || 0}%</div>
                  <div className="gd-perf-label">Average Score</div>
                </div>
                <div className="gd-perf-card gd-perf-card--success">
                  <div className="gd-perf-value">{perf.accuracy || 0}%</div>
                  <div className="gd-perf-label">Accuracy</div>
                </div>
                <div className="gd-perf-card gd-perf-card--warning">
                  <div className="gd-perf-value">{perf.improvement || "+0%"}</div>
                  <div className="gd-perf-label">Improvement</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Category Progress + Recent Activities ── */}
        <div className="gd-grid-mid">

          {/* Category progress */}
          <div className="gd-card">
            <div className="gd-card-header"><FaGraduationCap /> Progress by Category</div>
            <div className="gd-card-body">
              {data.categoryProgress.length === 0 ? (
                <div className="gd-empty">No category data yet.</div>
              ) : (
                data.categoryProgress.map((cat, i) => {
                  const pct = calcPct(cat.completed, cat.total);
                  return (
                    <div className="gd-progress-item" key={i}>
                      <div className="gd-progress-head">
                        <span className="gd-progress-name">
                          {getCategoryIcon(cat.category)}&nbsp;{cat.category}
                        </span>
                        <span className="gd-progress-pct">{pct}%</span>
                      </div>
                      <div className="gd-progress-track">
                        <div className="gd-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="gd-progress-detail">
                        <span>{cat.completed}/{cat.total} lessons</span>
                        <span>Score: {cat.score} · Accuracy: {cat.accuracy}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent activities */}
          <div className="gd-card">
            <div className="gd-card-header"><FaClock /> Recent Activities</div>
            <div className="gd-card-body">
              {data.recentActivities.length === 0 ? (
                <div className="gd-empty">No recent activities yet.</div>
              ) : (
                data.recentActivities.map((act) => (
                  <div className="gd-activity-item" key={act.id}>
                    <div className="gd-activity-icon">
                      {getCategoryIcon(act.category)}
                    </div>
                    <div className="gd-activity-body">
                      <div className="gd-activity-title">{act.activity}</div>
                      <div className="gd-activity-meta">
                        {act.category} · {fmtDate(act.date)}
                      </div>
                    </div>
                    <div className="gd-activity-score">{act.score}%</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Row 3: Achievements + Recommendations ── */}
        <div className="gd-grid-bot">

          {/* Achievements */}
          <div className="gd-card">
            <div className="gd-card-header"><FaTrophy /> Achievements</div>
            <div className="gd-card-body">
              {data.achievements.length === 0 ? (
                <div className="gd-empty">No achievements yet. Keep learning!</div>
              ) : (
                <div className="gd-achievements-grid">
                  {data.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`gd-achievement ${ach.unlocked ? "gd-achievement--unlocked" : "gd-achievement--locked"}`}
                    >
                      <div className="gd-achievement-icon">{ach.icon}</div>
                      <div className="gd-achievement-title">{ach.title}</div>
                      <div className="gd-achievement-desc">{ach.description}</div>
                      {ach.earned && (
                        <div className="gd-achievement-date">{fmtDate(ach.earned)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="gd-card">
            <div className="gd-card-header"><FaLightbulb /> Recommendations</div>
            <div className="gd-card-body">
              {data.recommendations.length === 0 ? (
                <div className="gd-empty">No recommendations right now.</div>
              ) : (
                data.recommendations.map((rec) => (
                  <div key={rec.id} className={`gd-rec-item gd-rec-item--${rec.priority}`}>
                    <div className="gd-rec-title">{rec.title}</div>
                    <div className="gd-rec-desc">{rec.description}</div>
                    <div className="gd-rec-tag">{rec.category}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Row 4: Learning Goals ── */}
        <div className="gd-card">
          <div className="gd-card-header"><FaBullseye /> Learning Goals</div>
          <div className="gd-card-body">
            {data.learningGoals.length === 0 ? (
              <div className="gd-empty">No learning goals set yet.</div>
            ) : (
              <div className="gd-goals-grid">
                {data.learningGoals.map((goal) => (
                  <div className="gd-goal-item" key={goal.id}>
                    <div className="gd-goal-title">{goal.goal}</div>
                    <div className="gd-goal-track">
                      <div className="gd-goal-fill" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <div className="gd-goal-meta">
                      <span>{goal.progress}% / {goal.target}%</span>
                      <span>
                        <FaCalendarAlt style={{ fontSize: "0.65rem" }} />{" "}
                        {fmtDate(goal.deadline)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuardianDashboard;

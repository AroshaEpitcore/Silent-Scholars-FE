import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
} from "react-icons/fa";
import { auth } from '../../firebase';

const GuardianDashboard = () => {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    childInfo: null,
    performanceOverview: null,
    categoryProgress: [],
    recentActivities: [],
    achievements: [],
    recommendations: [],
    learningGoals: []
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
        learningGoals
      ] = await Promise.all([
        GuardianDataService.getChildInfo(),
        GuardianDataService.getPerformanceOverview(),
        GuardianDataService.getCategoryProgress(),
        GuardianDataService.getRecentActivities(),
        GuardianDataService.getAchievements(),
        GuardianDataService.getRecommendations(),
        GuardianDataService.getLearningGoals()
      ]);

      setData({
        childInfo,
        performanceOverview,
        categoryProgress,
        recentActivities,
        achievements,
        recommendations,
        learningGoals
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    loadDashboardData();
  };

  // Get category icon based on category name
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Animal Signs":
        return <FaHandPaper />;
      case "Static Signs":
        return <FaGamepad />;
      case "Text to Sign":
        return <FaBook />;
      case "Traffic Signs":
        return <FaCar />;
      default:
        return <FaGraduationCap />;
    }
  };

  // Get priority color class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "";
    }
  };

  // Calculate progress percentage
  const calculateProgress = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Export data function
  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.childInfo?.name || 'student'}-progress-report.json`;
    link.click();
  };



  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guardian-dashboard">
        <div className="alert alert-danger m-3" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data.childInfo) {
    return (
      <div className="guardian-dashboard">
        <div className="alert alert-warning m-3" role="alert">
          <h4 className="alert-heading">No Data Available</h4>
          <p>No learning data found. Start learning to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guardian-dashboard">
      {/* Header */}
      <div className="guardian-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>Guardian Dashboard</h1>
                         <p>
               Monitor {data.childInfo?.name || 'Student'}'s learning progress and achievements
             </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={refreshDashboard}>
              <FaChartLine /> Refresh
            </button>
            <button className="btn btn-light" onClick={exportData}>
              <FaDownload /> Export Report
            </button>
            <Link to="/guardian-notifications" className="btn btn-light">
              <FaBell /> Notifications
            </Link>
            <Link to="/guardian-settings" className="btn btn-light">
              <FaCog /> Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Child Info Card */}
      <div className="child-info-card">
                 <div className="d-flex align-items-center mb-3">
           <img
             src={data.childInfo?.avatar || '/images/default-avatar.jpg'}
             alt={data.childInfo?.name || 'Student'}
             className="child-avatar me-3"
           />
           <div>
             <h3 className="mb-1">{data.childInfo?.name || 'Student'}</h3>
             <p className="mb-0 text-muted">
               {data.childInfo?.age || 'Not specified'} years old • {data.childInfo?.grade || 'Not specified'} • Member
               since {formatDate(data.childInfo?.joinDate || new Date())}
             </p>
           </div>
         </div>

                 <div className="child-stats">
           <div className="stat-item">
             <div className="stat-value">{data.childInfo?.totalLearningTime || '0h 0m'}</div>
             <div className="stat-label">Total Learning Time</div>
           </div>
           <div className="stat-item">
             <div className="stat-value">{data.childInfo?.currentStreak || 0}</div>
             <div className="stat-label">Day Streak</div>
           </div>
           <div className="stat-item">
             <div className="stat-value">
               {data.performanceOverview?.lessonsCompleted || 0}
             </div>
             <div className="stat-label">Lessons Completed</div>
           </div>
           <div className="stat-item">
             <div className="stat-value">
               {data.performanceOverview?.averageScore || 0}%
             </div>
             <div className="stat-label">Average Score</div>
           </div>
         </div>
      </div>

      {/* Performance Overview */}
      <div className="performance-overview">
        <h3 className="mb-3">
          <FaChartLine className="me-2" />
          Performance Overview
        </h3>
                 <div className="performance-grid">
           <div className="performance-card">
             <div className="performance-value">
               {data.performanceOverview?.totalScore || 0}
             </div>
             <div className="performance-label">Total Score</div>
           </div>
           <div className="performance-card">
             <div className="performance-value">
               {data.performanceOverview?.averageScore || 0}%
             </div>
             <div className="performance-label">Average Score</div>
           </div>
           <div className="performance-card">
             <div className="performance-value">
               {data.performanceOverview?.accuracy || 0}%
             </div>
             <div className="performance-label">Accuracy</div>
           </div>
           <div className="performance-card">
             <div className="performance-value">
               {data.performanceOverview?.improvement || '0%'}
             </div>
             <div className="performance-label">Improvement</div>
           </div>
         </div>
      </div>

      {/* Category Progress */}
      <div className="progress-section">
        <h3 className="mb-3">
          <FaGraduationCap className="me-2" />
          Learning Progress by Category
        </h3>
                 {data.categoryProgress?.map((category, index) => (
          <div key={index} className="progress-item">
            <div className="progress-header">
              <div className="d-flex align-items-center">
                <div className="me-2">{getCategoryIcon(category.category)}</div>
                <div className="progress-title">{category.category}</div>
              </div>
              <div className="progress-percentage">
                {calculateProgress(category.completed, category.total)}%
              </div>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${calculateProgress(
                    category.completed,
                    category.total
                  )}%`,
                }}
              ></div>
            </div>
            <div className="progress-details">
              <span>
                {category.completed} of {category.total} lessons completed
              </span>
              <span>
                Score: {category.score} • Accuracy: {category.accuracy}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="activities-section">
        <h3 className="mb-3">
          <FaClock className="me-2" />
          Recent Activities
        </h3>
                 {data.recentActivities?.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getCategoryIcon(activity.category)}
            </div>
            <div className="activity-content">
              <div className="activity-title">{activity.activity}</div>
              <div className="activity-meta">
                {activity.category} • {formatDate(activity.date)} at{" "}
                {activity.time}
              </div>
            </div>
            <div className="activity-score">{activity.score}%</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h3 className="mb-3">
          <FaTrophy className="me-2" />
          Achievements
        </h3>
        <div className="achievements-grid">
          {data.achievements?.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${
                achievement.unlocked ? "unlocked" : "locked"
              }`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">
                {achievement.description}
              </div>
              {achievement.earned && (
                <div className="achievement-date">
                  Earned {formatDate(achievement.earned)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3 className="mb-3">
          <FaLightbulb className="me-2" />
          Recommendations
        </h3>
                 {data.recommendations?.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`recommendation-item ${getPriorityClass(
              recommendation.priority
            )}`}
          >
            <div className="recommendation-title">{recommendation.title}</div>
            <div className="recommendation-description">
              {recommendation.description}
            </div>
            <div className="recommendation-category">
              {recommendation.category}
            </div>
          </div>
        ))}
      </div>

      {/* Learning Goals */}
      <div className="goals-section">
        <h3 className="mb-3">
          <FaBullseye className="me-2" />
          Learning Goals
        </h3>
                 {data.learningGoals?.map((goal) => (
          <div key={goal.id} className="goal-item">
            <div className="goal-header">
              <div className="goal-title">{goal.goal}</div>
              <div className="goal-deadline">
                <FaCalendarAlt className="me-1" />
                Due: {formatDate(goal.deadline)}
              </div>
            </div>
            <div className="goal-progress">
              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="goal-stats">
              <span>Progress: {goal.progress}%</span>
              <span>Target: {goal.target}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Progress Chart Placeholder */}
      <div className="chart-section">
        <h3 className="mb-3">
          <FaChartLine className="me-2" />
          Weekly Progress
        </h3>
        <div className="chart-container">
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <FaChartLine size={48} className="text-muted mb-3" />
              <p className="text-muted">
                Weekly progress chart will be displayed here
              </p>
              <p className="text-muted small">
                Integration with chart library needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;

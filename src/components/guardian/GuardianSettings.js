import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './guardian-dashboard.css';
import { 
  FaBell, 
  FaShieldAlt, 
  FaEye, 
  FaEyeSlash, 
  FaSave, 
  FaUndo,
  FaEnvelope,
  FaMobile,
  FaDesktop,
  FaChartBar,
  FaUserFriends,
  FaDatabase,
  FaDownload
} from 'react-icons/fa';

const GuardianSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      weeklyReport: true,
      achievementAlerts: true,
      lowPerformanceAlerts: true,
      milestoneCelebrations: true
    },
    privacy: {
      shareProgress: true,
      allowLeaderboard: true,
      dataCollection: true
    }
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.guardianSettings) {
          setSettings(userData.guardianSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        guardianSettings: settings
      });

      setHasChanges(false);
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    }
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        weeklyReport: true,
        achievementAlerts: true,
        lowPerformanceAlerts: true,
        milestoneCelebrations: true
      },
      privacy: {
        shareProgress: true,
        allowLeaderboard: true,
        dataCollection: true
      }
    });
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading settings...</p>
          </div>
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
             <h1>Guardian Settings</h1>
             <p>Configure your dashboard preferences and notifications</p>
           </div>
           {message && (
             <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mb-0`}>
               {message}
             </div>
           )}
          <div className="d-flex gap-2">
            <button 
              className="btn btn-light" 
              onClick={saveSettings}
              disabled={!hasChanges}
            >
              <FaSave /> Save Changes
            </button>
            <button 
              className="btn btn-outline-light" 
              onClick={resetSettings}
              disabled={!hasChanges}
            >
              <FaUndo /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="performance-overview">
        <h3 className="mb-3">
          <FaBell className="me-2" />
          Notification Preferences
        </h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  <FaEnvelope className="me-2" />
                  Email Notifications
                </h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="weeklyReport"
                    checked={settings.notifications.weeklyReport}
                    onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="weeklyReport">
                    Weekly Progress Report
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="achievementAlerts"
                    checked={settings.notifications.achievementAlerts}
                    onChange={(e) => handleNotificationChange('achievementAlerts', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="achievementAlerts">
                    Achievement Alerts
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lowPerformanceAlerts"
                    checked={settings.notifications.lowPerformanceAlerts}
                    onChange={(e) => handleNotificationChange('lowPerformanceAlerts', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="lowPerformanceAlerts">
                    Low Performance Alerts
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="milestoneCelebrations"
                    checked={settings.notifications.milestoneCelebrations}
                    onChange={(e) => handleNotificationChange('milestoneCelebrations', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="milestoneCelebrations">
                    Milestone Celebrations
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  <FaMobile className="me-2" />
                  Push Notifications
                </h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushWeeklyReport"
                    checked={settings.notifications.weeklyReport}
                    onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="pushWeeklyReport">
                    Weekly Progress Report
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushAchievementAlerts"
                    checked={settings.notifications.achievementAlerts}
                    onChange={(e) => handleNotificationChange('achievementAlerts', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="pushAchievementAlerts">
                    Achievement Alerts
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushLowPerformanceAlerts"
                    checked={settings.notifications.lowPerformanceAlerts}
                    onChange={(e) => handleNotificationChange('lowPerformanceAlerts', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="pushLowPerformanceAlerts">
                    Low Performance Alerts
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushMilestoneCelebrations"
                    checked={settings.notifications.milestoneCelebrations}
                    onChange={(e) => handleNotificationChange('milestoneCelebrations', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="pushMilestoneCelebrations">
                    Milestone Celebrations
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="progress-section">
        <h3 className="mb-3">
          <FaShieldAlt className="me-2" />
          Privacy & Data Settings
        </h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  <FaEye className="me-2" />
                  Visibility Settings
                </h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="shareProgress"
                    checked={settings.privacy.shareProgress}
                    onChange={(e) => handlePrivacyChange('shareProgress', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="shareProgress">
                    Share Progress with Teachers
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowLeaderboard"
                    checked={settings.privacy.allowLeaderboard}
                    onChange={(e) => handlePrivacyChange('allowLeaderboard', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="allowLeaderboard">
                    Allow Leaderboard Participation
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="dataCollection"
                    checked={settings.privacy.dataCollection}
                    onChange={(e) => handlePrivacyChange('dataCollection', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="dataCollection">
                    Allow Data Collection for Improvement
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  <FaDatabase className="me-2" />
                  Data Management
                </h5>
                <div className="mb-3">
                  <label className="form-label">Data Retention Period</label>
                  <select className="form-select">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365" selected>1 year</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Export Frequency</label>
                  <select className="form-select">
                    <option value="never">Never</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly" selected>Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <button className="btn btn-outline-primary">
                  <FaDownload /> Export All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Customization */}
      <div className="activities-section">
        <h3 className="mb-3">
          <FaDesktop className="me-2" />
          Dashboard Customization
        </h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  <FaChartBar className="me-2" />
                  Display Preferences
                </h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showWeeklyChart"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="showWeeklyChart">
                    Show Weekly Progress Chart
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showAchievements"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="showAchievements">
                    Show Achievements Section
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showRecommendations"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="showRecommendations">
                    Show Recommendations
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showLearningGoals"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="showLearningGoals">
                    Show Learning Goals
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  <FaUserFriends className="me-2" />
                  Social Features
                </h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showLeaderboard"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="showLeaderboard">
                    Show Leaderboard
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowSharing"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="allowSharing">
                    Allow Sharing Achievements
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showCommunity"
                  />
                  <label className="form-check-label" htmlFor="showCommunity">
                    Show Community Features
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes Banner */}
      {hasChanges && (
        <div className="position-fixed bottom-0 start-0 w-100 p-3" style={{ zIndex: 1000 }}>
          <div className="alert alert-warning d-flex justify-content-between align-items-center">
            <span>You have unsaved changes</span>
            <div>
              <button className="btn btn-primary btn-sm me-2" onClick={saveSettings}>
                <FaSave /> Save Changes
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={resetSettings}>
                <FaUndo /> Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianSettings;

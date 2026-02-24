import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './guardian-settings.css';
import {
  FaBell,
  FaShieldAlt,
  FaEye,
  FaSave,
  FaUndo,
  FaEnvelope,
  FaMobile,
  FaChartBar,
  FaUserFriends,
  FaDatabase,
  FaDownload,
  FaCog,
} from 'react-icons/fa';

const GuardianSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      weeklyReport:          true,
      achievementAlerts:     true,
      lowPerformanceAlerts:  true,
      milestoneCelebrations: true,
    },
    privacy: {
      shareProgress:    true,
      allowLeaderboard: true,
      dataCollection:   true,
    },
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState('');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists() && snap.data().guardianSettings) {
        setSettings(snap.data().guardianSettings);
      }
    } catch (e) {
      console.error(e);
      setMessage('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const setNotif = (key, val) => {
    setSettings(p => ({ ...p, notifications: { ...p.notifications, [key]: val } }));
    setHasChanges(true);
  };

  const setPrivacy = (key, val) => {
    setSettings(p => ({ ...p, privacy: { ...p.privacy, [key]: val } }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), { guardianSettings: settings });
      setHasChanges(false);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setMessage('Error saving settings');
    }
  };

  const resetSettings = () => {
    setSettings({
      notifications: { weeklyReport: true, achievementAlerts: true, lowPerformanceAlerts: true, milestoneCelebrations: true },
      privacy:       { shareProgress: true, allowLeaderboard: true, dataCollection: true },
    });
    setHasChanges(false);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="gs-page">
        <div className="gs-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p>Loading settings…</p>
        </div>
      </div>
    );
  }

  const n = settings.notifications;
  const p = settings.privacy;

  return (
    <div className="gs-page">
      <div className="gs-container">

        {/* ── Header ── */}
        <div className="gs-header">
          <div className="gs-header-icon"><FaCog /></div>
          <div className="gs-header-info">
            <h1>Guardian Settings</h1>
            <p>Configure dashboard preferences, notifications and privacy</p>
          </div>
          {message && (
            <span className={`gs-message ${message.includes('Error') ? 'gs-message--error' : 'gs-message--success'}`}>
              {message}
            </span>
          )}
          <div className="gs-header-actions">
            <button className="gs-btn gs-btn--primary" onClick={saveSettings} disabled={!hasChanges}>
              <FaSave /> Save Changes
            </button>
            <button className="gs-btn gs-btn--outline" onClick={resetSettings} disabled={!hasChanges}>
              <FaUndo /> Reset
            </button>
          </div>
        </div>

        {/* ── Section 1: Notifications ── */}
        <div className="gs-grid-2">

          {/* Email */}
          <div className="gs-card">
            <div className="gs-card-header gs-card-header--primary">
              <FaEnvelope /> Email Notifications
            </div>
            <div className="gs-card-body">
              <div className="gs-section-label">Choose what emails you receive</div>
              {[
                { key: 'weeklyReport',          label: 'Weekly Progress Report',    desc: 'Summary of learning activity every week'   },
                { key: 'achievementAlerts',     label: 'Achievement Alerts',        desc: 'When a new achievement is unlocked'        },
                { key: 'lowPerformanceAlerts',  label: 'Low Performance Alerts',    desc: 'When accuracy drops below threshold'       },
                { key: 'milestoneCelebrations', label: 'Milestone Celebrations',    desc: 'Celebrate key learning milestones'         },
              ].map(item => (
                <div className="gs-toggle-row" key={item.key}>
                  <div className="gs-toggle-info">
                    <div className="gs-toggle-label">{item.label}</div>
                    <div className="gs-toggle-desc">{item.desc}</div>
                  </div>
                  <label className="gs-toggle">
                    <input
                      type="checkbox"
                      checked={n[item.key]}
                      onChange={e => setNotif(item.key, e.target.checked)}
                    />
                    <span className="gs-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Push */}
          <div className="gs-card">
            <div className="gs-card-header gs-card-header--accent">
              <FaMobile /> Push Notifications
            </div>
            <div className="gs-card-body">
              <div className="gs-section-label">Choose what push alerts you receive</div>
              {[
                { key: 'weeklyReport',          label: 'Weekly Progress Report',    desc: 'Summary delivered to your device'          },
                { key: 'achievementAlerts',     label: 'Achievement Alerts',        desc: 'Instant alert on new achievements'         },
                { key: 'lowPerformanceAlerts',  label: 'Low Performance Alerts',    desc: 'Notify when performance dips'              },
                { key: 'milestoneCelebrations', label: 'Milestone Celebrations',    desc: 'Push alert for key milestones'             },
              ].map(item => (
                <div className="gs-toggle-row" key={`push-${item.key}`}>
                  <div className="gs-toggle-info">
                    <div className="gs-toggle-label">{item.label}</div>
                    <div className="gs-toggle-desc">{item.desc}</div>
                  </div>
                  <label className="gs-toggle">
                    <input
                      type="checkbox"
                      checked={n[item.key]}
                      onChange={e => setNotif(item.key, e.target.checked)}
                    />
                    <span className="gs-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Privacy ── */}
        <div className="gs-grid-2">

          {/* Visibility */}
          <div className="gs-card">
            <div className="gs-card-header gs-card-header--success">
              <FaEye /> Visibility Settings
            </div>
            <div className="gs-card-body">
              <div className="gs-section-label">Control who can see your data</div>
              {[
                { key: 'shareProgress',    label: 'Share Progress with Teachers', desc: 'Allow teachers to view learning progress'  },
                { key: 'allowLeaderboard', label: 'Leaderboard Participation',    desc: 'Show name and score on the leaderboard'    },
                { key: 'dataCollection',   label: 'Data Collection',              desc: 'Help improve the app with anonymous data'  },
              ].map(item => (
                <div className="gs-toggle-row" key={item.key}>
                  <div className="gs-toggle-info">
                    <div className="gs-toggle-label">{item.label}</div>
                    <div className="gs-toggle-desc">{item.desc}</div>
                  </div>
                  <label className="gs-toggle">
                    <input
                      type="checkbox"
                      checked={p[item.key]}
                      onChange={e => setPrivacy(item.key, e.target.checked)}
                    />
                    <span className="gs-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="gs-card">
            <div className="gs-card-header gs-card-header--warning">
              <FaDatabase /> Data Management
            </div>
            <div className="gs-card-body">
              <div className="gs-section-label">Manage stored data and exports</div>

              <div className="gs-select-row">
                <label className="gs-select-label">Data Retention Period</label>
                <select className="gs-select" defaultValue="365">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="forever">Forever</option>
                </select>
              </div>

              <div className="gs-select-row">
                <label className="gs-select-label">Auto-Export Frequency</label>
                <select className="gs-select" defaultValue="quarterly">
                  <option value="never">Never</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <button className="gs-btn gs-btn--export">
                <FaDownload /> Export All Data
              </button>
            </div>
          </div>
        </div>

        {/* ── Section 3: Dashboard Customisation ── */}
        <div className="gs-grid-2">

          {/* Display */}
          <div className="gs-card">
            <div className="gs-card-header gs-card-header--neutral">
              <FaChartBar /> Display Preferences
            </div>
            <div className="gs-card-body">
              <div className="gs-section-label">Choose which sections appear on your dashboard</div>
              {[
                { id: 'showWeeklyChart',      label: 'Weekly Progress Chart',   desc: 'Bar chart showing daily activity'      },
                { id: 'showAchievements',     label: 'Achievements Section',    desc: 'Display unlocked badges and trophies'  },
                { id: 'showRecommendations',  label: 'Recommendations',         desc: 'Suggested areas to focus on'           },
                { id: 'showLearningGoals',    label: 'Learning Goals',          desc: 'Show goal progress and deadlines'      },
              ].map(item => (
                <div className="gs-toggle-row" key={item.id}>
                  <div className="gs-toggle-info">
                    <div className="gs-toggle-label">{item.label}</div>
                    <div className="gs-toggle-desc">{item.desc}</div>
                  </div>
                  <label className="gs-toggle">
                    <input type="checkbox" id={item.id} defaultChecked />
                    <span className="gs-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="gs-card">
            <div className="gs-card-header gs-card-header--neutral">
              <FaUserFriends /> Social Features
            </div>
            <div className="gs-card-body">
              <div className="gs-section-label">Manage social and community features</div>
              {[
                { id: 'showLeaderboard',  label: 'Show Leaderboard',          desc: 'Display the global score leaderboard',     defaultChecked: true  },
                { id: 'allowSharing',     label: 'Share Achievements',        desc: 'Allow sharing badges with others',         defaultChecked: true  },
                { id: 'showCommunity',    label: 'Community Features',        desc: 'Enable community boards and discussions',  defaultChecked: false },
              ].map(item => (
                <div className="gs-toggle-row" key={item.id}>
                  <div className="gs-toggle-info">
                    <div className="gs-toggle-label">{item.label}</div>
                    <div className="gs-toggle-desc">{item.desc}</div>
                  </div>
                  <label className="gs-toggle">
                    <input type="checkbox" id={item.id} defaultChecked={item.defaultChecked} />
                    <span className="gs-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Sticky unsaved banner ── */}
      {hasChanges && (
        <div className="gs-unsaved-banner">
          <div className="gs-unsaved-text">
            <div className="gs-unsaved-dot" />
            You have unsaved changes
          </div>
          <div className="gs-unsaved-actions">
            <button className="gs-btn gs-btn--primary" onClick={saveSettings}>
              <FaSave /> Save Changes
            </button>
            <button className="gs-btn gs-btn--outline" onClick={resetSettings}>
              <FaUndo /> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianSettings;

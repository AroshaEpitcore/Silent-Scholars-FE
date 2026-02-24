import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import GuardianDataService from '../../services/GuardianDataService';
import './guardian-notifications.css';
import {
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
  FaTrophy,
  FaChartLine,
  FaClock,
} from 'react-icons/fa';

const ICON_MAP = {
  achievement:    { icon: <FaTrophy />,             cls: 'gn-notif-icon--achievement' },
  performance:    { icon: <FaExclamationTriangle />, cls: 'gn-notif-icon--performance' },
  milestone:      { icon: <FaCheckCircle />,         cls: 'gn-notif-icon--milestone'   },
  goal:           { icon: <FaChartLine />,            cls: 'gn-notif-icon--goal'        },
  recommendation: { icon: <FaInfoCircle />,           cls: 'gn-notif-icon--goal'        },
};

const PRIORITY_CLS = { high: 'gn-notif-item--high', medium: 'gn-notif-item--medium', low: 'gn-notif-item--low' };

const GuardianNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childInfo, setChildInfo] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const childData = await GuardianDataService.getChildInfo();
      setChildInfo(childData);

      const q = query(
        collection(db, 'guardianNotifications'),
        where('userId', '==', user.uid),
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate() || new Date() }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setNotifications(list);
    } catch (err) {
      console.error(err);
      setMessage('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'guardianNotifications', id), { read: true, readAt: serverTimestamp() });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    try {
      await updateDoc(doc(db, 'guardianNotifications', id), { active: false, deletedAt: serverTimestamp() });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n =>
        updateDoc(doc(db, 'guardianNotifications', n.id), { read: true, readAt: serverTimestamp() })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const clearAll = async () => {
    try {
      await Promise.all(notifications.map(n =>
        updateDoc(doc(db, 'guardianNotifications', n.id), { active: false, deletedAt: serverTimestamp() })
      ));
      setNotifications([]);
    } catch (err) { console.error(err); }
  };

  const formatTimeAgo = (ts) => {
    const diff = Math.floor((new Date() - ts) / 1000);
    if (diff < 60)      return 'Just now';
    if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return ts.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const highCount   = notifications.filter(n => n.priority === 'high').length;
  const achCount    = notifications.filter(n => n.type === 'achievement').length;
  const mileCount   = notifications.filter(n => n.type === 'milestone').length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="gn-page">
        <div className="gn-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p>Loading notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gn-page">
      <div className="gn-container">

        {/* ── Header ── */}
        <div className="gn-header">
          <div className="gn-header-icon"><FaBell /></div>
          <div className="gn-header-info">
            <h1>Notifications</h1>
            <p>Stay updated on {childInfo?.name || "your child's"} learning progress</p>
          </div>
          {message && (
            <span style={{ fontSize: '0.78rem', color: message.includes('Error') ? '#ef4444' : '#16a34a', fontWeight: 600 }}>
              {message}
            </span>
          )}
          <div className="gn-header-actions">
            <button className="gn-btn gn-btn--primary" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <FaCheckCircle /> Mark All Read
            </button>
            <button className="gn-btn gn-btn--outline" onClick={clearAll} disabled={notifications.length === 0}>
              <FaTimes /> Clear All
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="gn-stats">
          <div className="gn-stat">
            <div className="gn-stat-value gn-stat-value--danger">{unreadCount}</div>
            <div className="gn-stat-label">Unread</div>
          </div>
          <div className="gn-stat">
            <div className="gn-stat-value gn-stat-value--warning">{highCount}</div>
            <div className="gn-stat-label">High Priority</div>
          </div>
          <div className="gn-stat">
            <div className="gn-stat-value gn-stat-value--accent">{achCount}</div>
            <div className="gn-stat-label">Achievements</div>
          </div>
          <div className="gn-stat">
            <div className="gn-stat-value gn-stat-value--success">{mileCount}</div>
            <div className="gn-stat-label">Milestones</div>
          </div>
        </div>

        {/* ── 2-col grid ── */}
        <div className="gn-main-grid">

          {/* Notifications list */}
          <div className="gn-card">
            <div className="gn-card-header">
              <span><FaBell style={{ marginRight: '0.4rem' }} />Recent Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.75rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="gn-card-body">
              {notifications.length === 0 ? (
                <div className="gn-empty">
                  <div className="gn-empty-icon"><FaBell /></div>
                  <p>No notifications yet</p>
                  <span>You'll see important updates about learning progress here.</span>
                </div>
              ) : (
                notifications.map((n) => {
                  const iconInfo = ICON_MAP[n.type] || { icon: <FaBell />, cls: 'gn-notif-icon--default' };
                  return (
                    <div
                      key={n.id}
                      className={`gn-notif-item ${!n.read ? 'gn-notif-item--unread' : ''} ${PRIORITY_CLS[n.priority] || ''}`}
                    >
                      {/* Icon */}
                      <div className={`gn-notif-icon ${iconInfo.cls}`}>
                        {iconInfo.icon}
                      </div>

                      {/* Body */}
                      <div className="gn-notif-body">
                        <div className="gn-notif-title">{n.title}</div>
                        <div className="gn-notif-msg">{n.message}</div>
                        <div className="gn-notif-time">
                          <FaClock style={{ fontSize: '0.65rem' }} />
                          {formatTimeAgo(n.timestamp)}
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!n.read && <div className="gn-unread-dot" />}

                      {/* Actions */}
                      <div className="gn-notif-actions">
                        {!n.read && (
                          <button
                            className="gn-btn gn-btn--ghost gn-btn--ghost-blue"
                            onClick={() => markAsRead(n.id)}
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="gn-btn gn-btn--ghost gn-btn--ghost-red"
                          onClick={() => deleteNotification(n.id)}
                          title="Delete"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="gn-card">
            <div className="gn-card-header">
              <span>Preferences</span>
            </div>
            <div className="gn-card-body">

              {/* Email */}
              <div className="gn-pref-group">
                <div className="gn-pref-group-title">Email Notifications</div>
                {[
                  { id: 'email-ach',  label: 'Achievement alerts',  defaultChecked: true  },
                  { id: 'email-perf', label: 'Performance alerts',  defaultChecked: true  },
                  { id: 'email-week', label: 'Weekly reports',      defaultChecked: true  },
                ].map(item => (
                  <div className="gn-pref-item" key={item.id}>
                    <label className="gn-pref-label" htmlFor={item.id}>{item.label}</label>
                    <label className="gn-toggle">
                      <input type="checkbox" id={item.id} defaultChecked={item.defaultChecked} />
                      <span className="gn-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              {/* Push */}
              <div className="gn-pref-group">
                <div className="gn-pref-group-title">Push Notifications</div>
                {[
                  { id: 'push-ach',   label: 'Achievement alerts',      defaultChecked: true  },
                  { id: 'push-perf',  label: 'Performance alerts',      defaultChecked: false },
                  { id: 'push-mile',  label: 'Milestone celebrations',  defaultChecked: true  },
                ].map(item => (
                  <div className="gn-pref-item" key={item.id}>
                    <label className="gn-pref-label" htmlFor={item.id}>{item.label}</label>
                    <label className="gn-toggle">
                      <input type="checkbox" id={item.id} defaultChecked={item.defaultChecked} />
                      <span className="gn-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuardianNotifications;

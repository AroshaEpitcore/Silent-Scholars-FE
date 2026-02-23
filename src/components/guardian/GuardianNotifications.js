import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import GuardianDataService from '../../services/GuardianDataService';
import './guardian-dashboard.css';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaInfoCircle, 
  FaTimes,
  FaTrophy,
  FaChartLine,
  FaClock
} from 'react-icons/fa';

const GuardianNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childInfo, setChildInfo] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Load child info
      const childData = await GuardianDataService.getChildInfo();
      setChildInfo(childData);

      // Load notifications from Firestore
      const notificationsQuery = query(
        collection(db, 'guardianNotifications'),
        where('userId', '==', user.uid),
        where('active', '==', true)
      );
      const snapshot = await getDocs(notificationsQuery);
      
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      // Sort by timestamp (newest first)
      notificationsData.sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setMessage('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Update in Firestore
      const notificationRef = doc(db, 'guardianNotifications', id);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Mark as inactive in Firestore (soft delete)
      const notificationRef = doc(db, 'guardianNotifications', id);
      await updateDoc(notificationRef, {
        active: false,
        deletedAt: serverTimestamp()
      });

      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update all unread notifications in Firestore
      const updatePromises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'guardianNotifications', notification.id);
        return updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Mark all notifications as inactive in Firestore
      const updatePromises = notifications.map(notification => {
        const notificationRef = doc(db, 'guardianNotifications', notification.id);
        return updateDoc(notificationRef, {
          active: false,
          deletedAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);

      // Clear local state
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return timestamp.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <FaTrophy className="text-warning" />;
      case 'performance':
        return <FaExclamationTriangle className="text-danger" />;
      case 'milestone':
        return <FaCheckCircle className="text-success" />;
      case 'goal':
        return <FaChartLine className="text-info" />;
      case 'recommendation':
        return <FaInfoCircle className="text-primary" />;
      default:
        return <FaBell className="text-muted" />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-danger';
      case 'medium':
        return 'border-warning';
      case 'low':
        return 'border-success';
      default:
        return 'border-muted';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="guardian-dashboard">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading notifications...</p>
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
            <h1>Notifications</h1>
            <p>Stay updated on {childInfo?.name || "your child's"} learning progress</p>
          </div>
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mb-0`}>
              {message}
            </div>
          )}
          <div className="d-flex gap-2">
            <button 
              className="btn btn-light" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <FaCheckCircle /> Mark All Read
            </button>
            <button 
              className="btn btn-outline-light"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <FaTimes /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="child-info-card">
        <div className="row text-center">
          <div className="col-md-3">
            <div className="stat-value text-danger">{unreadCount}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="col-md-3">
            <div className="stat-value text-warning">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <div className="stat-label">High Priority</div>
          </div>
          <div className="col-md-3">
            <div className="stat-value text-info">
              {notifications.filter(n => n.type === 'achievement').length}
            </div>
            <div className="stat-label">Achievements</div>
          </div>
          <div className="col-md-3">
            <div className="stat-value text-success">
              {notifications.filter(n => n.type === 'milestone').length}
            </div>
            <div className="stat-label">Milestones</div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="activities-section">
        <h3 className="mb-3">
          <FaBell className="me-2" />
          Recent Notifications
        </h3>
        
        {notifications.length === 0 ? (
          <div className="text-center py-5">
            <FaBell size={48} className="text-muted mb-3" />
            <h4 className="text-muted">No notifications yet</h4>
            <p className="text-muted">You'll see important updates about your child's progress here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item card mb-3 ${getPriorityClass(notification.priority)} ${!notification.read ? 'border-start border-4' : ''}`}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <div className="notification-icon me-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className={`card-title mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                            {notification.title}
                          </h6>
                          <p className="card-text text-muted mb-2">
                            {notification.message}
                          </p>
                          <div className="d-flex align-items-center text-muted small">
                            <FaClock className="me-1" />
                            {formatTimeAgo(notification.timestamp)}
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          {!notification.read && (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="progress-section">
        <h3 className="mb-3">
          <FaBell className="me-2" />
          Notification Preferences
        </h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Email Notifications</h6>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="emailAchievements" defaultChecked />
                  <label className="form-check-label" htmlFor="emailAchievements">
                    Achievement alerts
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="emailPerformance" defaultChecked />
                  <label className="form-check-label" htmlFor="emailPerformance">
                    Performance alerts
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="emailWeekly" defaultChecked />
                  <label className="form-check-label" htmlFor="emailWeekly">
                    Weekly reports
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Push Notifications</h6>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="pushAchievements" defaultChecked />
                  <label className="form-check-label" htmlFor="pushAchievements">
                    Achievement alerts
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="pushPerformance" />
                  <label className="form-check-label" htmlFor="pushPerformance">
                    Performance alerts
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="pushMilestones" defaultChecked />
                  <label className="form-check-label" htmlFor="pushMilestones">
                    Milestone celebrations
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianNotifications;

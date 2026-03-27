import React from 'react';
import CowModel from '../../../components/animals/cow/Cowmodel';
import CowSignlanguage from '../../../components/animals/cow/Cowsignlanguage';
import { useNavigate } from 'react-router-dom';
import { FaPaw, FaArrowLeft, FaPlay } from 'react-icons/fa';
import '../animal-learn.css';

export default function LearnCow() {
  const navigate = useNavigate();

  return (
    <div className="al-page">
      <div className="al-container">

        {/* Header */}
        <div className="al-header">
          <div className="al-header-icon"><FaPaw /></div>
          <div className="al-header-info">
            <h1>Cow Sign Language</h1>
            <p>Watch the video and study the 3D model before practising</p>
          </div>
          <div className="al-header-actions">
            <button className="al-btn al-btn--primary" onClick={() => navigate('/practise-cow')}>
              <FaPlay /> Start Practice
            </button>
            <button className="al-btn al-btn--ghost" onClick={() => navigate('/dashboard-animals')}>
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {/* 2-col grid */}
        <div className="al-grid">

          <div className="al-card">
            <div className="al-card-header"><FaPaw /> 3D Model</div>
            <div className="al-card-body">
              <div className="al-model-wrap">
                <CowModel />
              </div>
            </div>
          </div>

          <div className="al-card">
            <div className="al-card-header">Sign Language Video</div>
            <div className="al-card-body">
              <div className="al-video-wrap">
                <CowSignlanguage />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

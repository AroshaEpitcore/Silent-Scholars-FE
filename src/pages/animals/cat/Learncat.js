import React from 'react';
import CatModel from '../../../components/animals/cat/Catmodel';
import CatSignlanguage from '../../../components/animals/cat/Catsignlanguage';
import { useNavigate } from 'react-router-dom';
import { FaCat, FaArrowLeft, FaPlay } from 'react-icons/fa';
import '../animal-learn.css';

export default function LearnCat() {
  const navigate = useNavigate();

  return (
    <div className="al-page">
      <div className="al-container">

        {/* Header */}
        <div className="al-header">
          <div className="al-header-icon"><FaCat /></div>
          <div className="al-header-info">
            <h1>Cat Sign Language</h1>
            <p>Watch the video and study the 3D model before practising</p>
          </div>
          <div className="al-header-actions">
            <button className="al-btn al-btn--primary" onClick={() => navigate('/practise-cat')}>
              <FaPlay /> Start Practice
            </button>
            <button className="al-btn al-btn--ghost" onClick={() => navigate('/dashboard-animals')}>
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {/* 2-col grid */}
        <div className="al-grid">

          {/* 3D Model */}
          <div className="al-card">
            <div className="al-card-header"><FaCat /> 3D Model</div>
            <div className="al-card-body">
              <div className="al-model-wrap">
                <CatModel />
              </div>
            </div>
          </div>

          {/* Sign Language Video */}
          <div className="al-card">
            <div className="al-card-header">Sign Language Video</div>
            <div className="al-card-body">
              <div className="al-video-wrap">
                <CatSignlanguage />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

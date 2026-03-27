import React from 'react';
import DogModel from '../../../components/animals/dog/Dogmodel';
import DogSignlanguage from '../../../components/animals/dog/Dogsignlanguage';
import { useNavigate } from 'react-router-dom';
import { FaDog, FaArrowLeft, FaPlay } from 'react-icons/fa';
import '../animal-learn.css';

export default function LearnDog() {
  const navigate = useNavigate();

  return (
    <div className="al-page">
      <div className="al-container">

        {/* Header */}
        <div className="al-header">
          <div className="al-header-icon"><FaDog /></div>
          <div className="al-header-info">
            <h1>Dog Sign Language</h1>
            <p>Watch the video and study the 3D model before practising</p>
          </div>
          <div className="al-header-actions">
            <button className="al-btn al-btn--primary" onClick={() => navigate('/practise-dog')}>
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
            <div className="al-card-header"><FaDog /> 3D Model</div>
            <div className="al-card-body">
              <div className="al-model-wrap">
                <DogModel />
              </div>
            </div>
          </div>

          <div className="al-card">
            <div className="al-card-header">Sign Language Video</div>
            <div className="al-card-body">
              <div className="al-video-wrap">
                <DogSignlanguage />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

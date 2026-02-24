import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import { StaticSignData } from "../../../Data/StaticSignData";
import { useNavigate } from "react-router-dom";
import "./learn-static-sign.css";

let time = 0;
let landmarks = null;

export default function LearnStaticSign() {
  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraData, setCameraData] = useState(null);
  const [SignData] = useState(StaticSignData);
  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();

  const routePractice = () => {
    navigate(`/practise-static-sign/${SignData[currentStep].id}`);
  };

  const routeHome = () => {
    navigate(`/static-sign-dashboard`);
  };

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    startDetection();
  };

  async function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    let totalLandmarks = [];
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 });
        connect(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        await landmarks.map((item) => {
          totalLandmarks.push(item.x);
          totalLandmarks.push(item.y);
          totalLandmarks.push(item.z);
        });
      }
      const data = { temp: totalLandmarks };
      if (totalLandmarks.length === 63) {
        console.log(result);
        setPredictData(result.data);
      }
    }
    canvasCtx.restore();
  }

  const startDetection = () => {
    setIsStarted(true);
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);
    if (webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try {
            await hands.send({ image: webcamRef.current.video });
          } catch (error) {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const stopDetection = () => {
    camera.stop();
    setIsStarted(false);
    setIsCameraOn(false);
  };

  const total = SignData.length;
  const progressPct = Math.round(((currentStep + 1) / total) * 100);
  const current = SignData[currentStep];

  return (
    <div className="lss-page">
      <div className="lss-container">

        {/* ── Header ── */}
        <div className="lss-header">
          <button className="lss-back-btn" onClick={routeHome}>
            ← Back
          </button>
          <div className="lss-header-info">
            <h1>Static Sign Language</h1>
            <p>Learn the hand sign for each letter of the alphabet</p>
          </div>
          <div className="lss-header-progress">
            <div className="lss-progress-bar-wrap">
              <div className="lss-progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="lss-step-badge">
              {currentStep + 1} / {total}
            </div>
          </div>
        </div>

        {/* ── Main 3-column grid ── */}
        <div className="lss-main-grid">

          {/* Left — Alphabet letter */}
          <div className="lss-card">
            <div className="lss-card-header">Letter</div>
            <div className="lss-card-body">
              <div className="lss-img-box">
                <img src={current.alphabetImage} alt={`Letter ${current.name}`} />
              </div>
              <div className="lss-img-label">Alphabet — {current.name}</div>
            </div>
          </div>

          {/* Middle — Hand sign */}
          <div className="lss-card">
            <div className="lss-card-header">Hand Sign</div>
            <div className="lss-card-body">
              <div className="lss-img-box">
                <img src={current.signImage} alt={`Sign for ${current.name}`} />
              </div>
              <div className="lss-img-label">Sign for "{current.name}"</div>
            </div>
          </div>

          {/* Right — Controls */}
          <div className="lss-card">
            <div className="lss-card-header">Practice</div>
            <div className="lss-card-body">
              <div className="lss-sign-name">{current.name}</div>
              <div className="lss-sign-subtitle">Current Sign</div>

              <button className="lss-btn-practice" onClick={routePractice}>
                ▶ Practice This Sign
              </button>

              <div className="lss-nav-row">
                <button
                  className="lss-btn-nav"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                >
                  ← Prev
                </button>

                {currentStep < total - 1 ? (
                  <button
                    className="lss-btn-nav lss-btn-nav--next"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="lss-btn-nav lss-btn-nav--next"
                    onClick={routeHome}
                  >
                    Done ✓
                  </button>
                )}
              </div>

              <div className="lss-tip">
                Tip: Study the reference image carefully, then click <strong>Practice</strong> to test yourself with the camera.
              </div>
            </div>
          </div>
        </div>

        {/* ── Letter strip ── */}
        <div className="lss-letter-strip">
          <span className="lss-strip-label">All Signs</span>
          {SignData.map((sign, idx) => (
            <button
              key={sign.id}
              className={`lss-letter-dot ${
                idx === currentStep
                  ? "lss-letter-dot--active"
                  : idx < currentStep
                  ? "lss-letter-dot--done"
                  : ""
              }`}
              onClick={() => setCurrentStep(idx)}
              title={`Sign ${sign.name}`}
            >
              {sign.name}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

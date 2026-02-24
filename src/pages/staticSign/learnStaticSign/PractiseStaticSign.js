import React, { useState, useRef } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from "./Test";
import { StaticSignData } from "../../../Data/StaticSignData";
import { useNavigate, useParams } from "react-router-dom";
import "./practise-static-sign.css";

export default function PracticeStaticSign() {
  const navigate = useNavigate();
  const routeLearn = () => navigate("/learn-static-sign");

  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraData, setCameraData] = useState(null);
  const [SignData] = useState(StaticSignData);
  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  const { id } = useParams();

  const sign = SignData[id - 1];

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    setIsCameraOn(true);
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
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
        connect(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        landmarks.map((item) => {
          totalLandmarks.push(item.x, item.y, item.z);
        });
      }

      if (totalLandmarks.length === 63) {
        const result = await axios.post("http://127.0.0.1:5000/predict-static-sign", { temp: totalLandmarks });
        setLandmarkClass(result.data.predict);
        setProbability(result.data.probability);
      }
    }

    canvasCtx.restore();
  }

  const startDetection = () => {
    setIsStarted(true);
    const handsInstance = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    handsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    handsInstance.onResults(onResults);
    if (webcamRef.current) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try {
            await handsInstance.send({ image: webcamRef.current.video });
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
    if (cameraData) cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    routeLearn();
  };

  /* ── derive status ── */
  const isCorrect = practice && landmarkClass === sign.name;
  const isHighConf = probability > 0.7;
  const probPct = Math.round(probability * 100);

  const getStatus = () => {
    if (learn) return "idle";
    if (isCorrect && isHighConf) return "success";
    if (isCorrect && !isHighConf) return "warning";
    return "error";
  };

  const statusMap = {
    idle:    { icon: "▶",  title: "Ready to Practice?",   sub: "Click Start to activate the camera",       cls: "pss-status-box--idle"    },
    success: { icon: "✅", title: "Perfect Match!",        sub: "Great job! You nailed this sign.",          cls: "pss-status-box--success" },
    warning: { icon: "⚠️", title: "Almost There!",         sub: "You're close — try to match it more precisely.", cls: "pss-status-box--warning" },
    error:   { icon: "❌", title: "Keep Trying!",          sub: "Your sign doesn't match yet. Adjust your hand.", cls: "pss-status-box--error"   },
  };

  const status = getStatus();
  const s = statusMap[status];

  const confFillClass =
    probPct >= 70 ? "pss-conf-fill--good" :
    probPct >= 40 ? "pss-conf-fill--ok"   : "pss-conf-fill--bad";

  return (
    <div className="pss-page">
      <div className="pss-container">

        {/* ── Header ── */}
        <div className="pss-header">
          <button className="pss-back-btn" onClick={routeLearn}>
            ← Back
          </button>
          <div className="pss-header-info">
            <h1>Static Sign Practice</h1>
            <p>Position your hand in front of the camera and match the reference sign</p>
          </div>
          <div className="pss-sign-badge">{sign.name}</div>
        </div>

        {/* ── Main 3-column grid ── */}
        <div className="pss-main-grid">

          {/* Left — Reference */}
          <div className="pss-card">
            <div className="pss-card-header pss-card-header--primary">Target Sign</div>
            <div className="pss-card-body">
              <div className="pss-img-box">
                <img src={sign.alphabetImage} alt={`Letter ${sign.name}`} />
              </div>
              <div className="pss-img-label">Letter "{sign.name}"</div>

              <div className="pss-img-box" style={{ marginTop: "0.75rem", minHeight: "160px" }}>
                <img src={sign.signImage} alt={`Sign for ${sign.name}`} />
              </div>
              <div className="pss-img-label">Hand sign reference</div>
            </div>
          </div>

          {/* Middle — Camera */}
          <div className="pss-card">
            <div className="pss-card-header pss-card-header--accent">Live Camera</div>
            <div className="pss-card-body">
              {isCameraOn ? (
                <Test webcamRef={webcamRef} canvasRef={canvasRef} />
              ) : (
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: '12px', background: '#0f172a' }}>
                  <div className="pss-camera-off" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>📷</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Camera inactive</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Click Start to begin</span>
                  </div>
                </div>
              )}

              {/* Prediction row */}
              {practice && (
                <div className="pss-prediction-row" style={{ marginTop: '0.75rem' }}>
                  <span className="pss-pred-label">Detected</span>
                  <span className="pss-pred-value">{landmarkClass}</span>
                  <span className="pss-pred-prob">{probPct}%</span>
                </div>
              )}

              {/* Confidence bar */}
              {practice && (
                <>
                  <div className="pss-conf-track">
                    <div
                      className={`pss-conf-fill ${confFillClass}`}
                      style={{ width: `${probPct}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#718096', fontWeight: 500, marginTop: '0.25rem' }}>
                    <span>Confidence</span>
                    <span>{probPct}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right — Status + Controls */}
          <div className="pss-card">
            <div className="pss-card-header pss-card-header--neutral">Status</div>
            <div className="pss-card-body">

              <div className={`pss-status-box ${s.cls}`}>
                <div className="pss-status-icon">{s.icon}</div>
                <div className="pss-status-title">{s.title}</div>
                <div className="pss-status-sub">{s.sub}</div>
              </div>

              {learn && (
                <button className="pss-btn-start" onClick={onClickStart}>
                  ▶ Start Practice
                </button>
              )}

              {practice && (
                <button className="pss-btn-back" onClick={stopDetection}>
                  ← Back to Learning
                </button>
              )}

              <div className="pss-tip">
                Tip: Hold your hand steady and ensure good lighting for better detection accuracy.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

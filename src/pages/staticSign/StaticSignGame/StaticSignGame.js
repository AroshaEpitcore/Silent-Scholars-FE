import React, { useState, useRef } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from './Test';
import { StaticSignData } from '../../../Data/StaticSignData';
import { useNavigate } from "react-router-dom";
import { db, auth } from '../../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import "./static-sign-game.css";

// The sequence of letters the player must sign in order
const GAME_SEQUENCE = ['A', 'B', 'C', 'D', 'E'];

let go = 0; // global step tracker (preserves original logic)

export default function StaticSignGame() {
  const navigate = useNavigate();
  const routeLeaderboard = () => navigate('/leaderboard');

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;

  const [SignData] = useState(StaticSignData);
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraData, setCameraData] = useState(null);
  const [landmarkClass, setLandmarkClass] = useState("—");
  const [probability, setProbability] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalMarks, setTotalMarks] = useState(100);
  const [startTime, setStartTime] = useState(null);

  const stopDetection = () => {
    if (cameraData) cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    calculateScore();
    routeLeaderboard();
  };

  const calculateScore = async () => {
    const user = auth.currentUser;
    const endTime = Date.now();
    const elapsedTime = startTime ? endTime - startTime : 0;

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { score: totalMarks }, { merge: true });

        const GuardianDataService = (await import('../../../services/GuardianDataService')).default;
        await GuardianDataService.recordActivity({
          activityName: 'Completed Static Signs Lesson',
          category: 'Static Signs',
          duration: Math.round(elapsedTime / 1000 / 60),
          score: totalMarks
        });
        await GuardianDataService.recordScore({
          score: totalMarks,
          category: 'staticSigns',
          accuracy: Math.round((totalMarks / 100) * 100),
          lessonType: 'Static Signs'
        });
        await GuardianDataService.checkAchievements();
        await GuardianDataService.createPerformanceAlert(user.uid, 'Static Signs', Math.round((totalMarks / 100) * 100));

        const scores = await GuardianDataService.getUserScores(user.uid);
        if (scores.length === 1) {
          await GuardianDataService.createMilestoneNotification(
            user.uid,
            'Congratulations! You completed your first lesson.'
          );
        }
      } catch (error) {
        console.error("Error saving marks to Firebase:", error);
      }
    }
  };

  async function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let totalLandmarks = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
        connect(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
        await landmarks.map((item) => {
          totalLandmarks.push(item.x);
          totalLandmarks.push(item.y);
          totalLandmarks.push(item.z);
        });
      }

      if (totalLandmarks.length === 63) {
        const res = await axios.post('http://127.0.0.1:5000/predict-static-sign', { temp: totalLandmarks });
        setLandmarkClass(res.data.predict);
        setProbability(res.data.probability);

        if (res.data.predict === 'A' && res.data.probability > 0.5 && go === 0) {
          go = 1; setCurrentStep(1);
        } else if (res.data.predict === 'B' && res.data.probability > 0.5 && go === 1) {
          go = 2; setCurrentStep(2);
        } else if (res.data.predict === 'C' && res.data.probability > 0.5 && go === 2) {
          go = 3; setCurrentStep(3);
        } else if (res.data.predict === 'D' && res.data.probability > 0.5 && go === 3) {
          go = 4; setCurrentStep(4);
        } else if (res.data.predict === 'E' && res.data.probability > 0.5 && go === 4) {
          setResult(true);
        }
      }
    }
    canvasCtx.restore();
  }

  const startDetection = () => {
    setIsStarted(true);
    setIsCameraOn(true);
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
          try { await handsInstance.send({ image: webcamRef.current.video }); } catch (e) {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    setIsCameraOn(true);
    startDetection();
    setStartTime(Date.now());
  };

  const nextStep = () => {
    setTotalMarks(prev => prev - 20);
    go = go + 1;
    setCurrentStep(go);
  };

  /* ── derived state ── */
  const probPct = Math.round(probability * 100);
  const confFillClass =
    probPct >= 70 ? "ssg-conf-fill--good" :
    probPct >= 40 ? "ssg-conf-fill--ok"   : "ssg-conf-fill--bad";

  // find alphabet image for current game step
  const currentSignData = SignData.find(s => s.name === GAME_SEQUENCE[go]) || SignData[0];

  const getStatus = () => {
    if (learn)   return "idle";
    if (result)  return "success";
    return "playing";
  };
  const status = getStatus();

  return (
    <div className="ssg-page">
      <div className="ssg-container">

        {/* ── Header ── */}
        <div className="ssg-header">
          <div className="ssg-header-info">
            <h1>Static Sign Game</h1>
            <p>Sign the letters in sequence: A → B → C → D → E</p>
          </div>

          {/* Letter sequence progress */}
          <div className="ssg-sequence">
            {GAME_SEQUENCE.map((letter, idx) => {
              const isDone   = idx < go || result;
              const isActive = idx === go && !result && !learn;
              return (
                <React.Fragment key={letter}>
                  {idx > 0 && (
                    <div className={`ssg-step-connector ${idx <= go ? "ssg-step-connector--done" : ""}`} />
                  )}
                  <div className={`ssg-step ${isDone ? "ssg-step--done" : isActive ? "ssg-step--active" : "ssg-step--upcoming"}`}>
                    {isDone ? "✓" : letter}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Score */}
          <div className="ssg-score-badge">
            <span className="ssg-score-value">{totalMarks}</span>
            <span className="ssg-score-label">Score</span>
          </div>
        </div>

        {/* ── Main 3-column grid ── */}
        <div className="ssg-main-grid">

          {/* Left — Target sign */}
          <div className="ssg-card">
            <div className="ssg-card-header ssg-card-header--primary">Target Sign</div>
            <div className="ssg-card-body">
              <div className="ssg-current-letter">{GAME_SEQUENCE[Math.min(go, GAME_SEQUENCE.length - 1)]}</div>
              <div className="ssg-current-label">Sign this letter</div>
              <div className="ssg-img-box">
                <img
                  src={currentSignData.alphabetImage}
                  alt={`Letter ${GAME_SEQUENCE[go]}`}
                />
              </div>
            </div>
          </div>

          {/* Middle — Camera */}
          <div className="ssg-card">
            <div className="ssg-card-header ssg-card-header--accent">Live Camera</div>
            <div className="ssg-card-body">
              {isCameraOn ? (
                <Test webcamRef={webcamRef} canvasRef={canvasRef} />
              ) : (
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: '12px', background: '#0f172a' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>📷</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Camera inactive</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Click Start Game to begin</span>
                  </div>
                </div>
              )}

              {/* Live detection */}
              {practice && (
                <>
                  <div className="ssg-detect-row">
                    <span className="ssg-detect-label">Detected</span>
                    <span className="ssg-detect-value">{landmarkClass}</span>
                    <span className="ssg-detect-prob">{probPct}%</span>
                  </div>
                  <div className="ssg-conf-track">
                    <div className={`ssg-conf-fill ${confFillClass}`} style={{ width: `${probPct}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#718096', fontWeight: 500, marginTop: '0.2rem' }}>
                    <span>Confidence</span>
                    <span>{probPct}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right — Controls */}
          <div className="ssg-card">
            <div className="ssg-card-header ssg-card-header--neutral">Game Controls</div>
            <div className="ssg-card-body">

              {/* Status box */}
              {status === "idle" && (
                <div className="ssg-status-box ssg-status-box--idle">
                  <div className="ssg-status-icon">🎮</div>
                  <div className="ssg-status-title">Ready to Play?</div>
                  <div className="ssg-status-sub">Sign A → B → C → D → E in order to complete the game</div>
                </div>
              )}

              {status === "playing" && (
                <div className="ssg-status-box ssg-status-box--playing">
                  <div className="ssg-status-icon">👋</div>
                  <div className="ssg-status-title">Show Sign "{GAME_SEQUENCE[Math.min(go, 4)]}"</div>
                  <div className="ssg-status-sub">
                    Step {go + 1} of {GAME_SEQUENCE.length} — hold your hand steady
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="ssg-status-box ssg-status-box--success">
                  <div className="ssg-status-icon">🏆</div>
                  <div className="ssg-status-title">Well Done!</div>
                  <div className="ssg-status-sub">You completed the sequence! Final score: {totalMarks}</div>
                </div>
              )}

              {/* Buttons */}
              {learn && (
                <button className="ssg-btn ssg-btn--primary" onClick={onClickStart}>
                  ▶ Start Game
                </button>
              )}

              {practice && !result && (
                <>
                  <div className="ssg-deduct-note">
                    ⚠ Skipping deducts 20 points from your score
                  </div>
                  <button className="ssg-btn ssg-btn--warning" onClick={nextStep}>
                    Skip → Next Sign
                  </button>
                </>
              )}

              {result && (
                <button className="ssg-btn ssg-btn--success" onClick={stopDetection}>
                  ✓ Finish & View Leaderboard
                </button>
              )}

              <div className="ssg-tip">
                Tip: Sign each letter clearly and hold steady for 1–2 seconds. Skip only if you're stuck — each skip costs 20 points.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

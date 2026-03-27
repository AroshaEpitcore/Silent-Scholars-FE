import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Hands } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaPlay, FaArrowLeft, FaRedo, FaCheckCircle,
  FaSpinner, FaCamera, FaHandPaper, FaExclamationTriangle,
} from 'react-icons/fa';
import GuardianDataService from '../../services/GuardianDataService';
import '../../pages/animals/animal-practise.css';

const API_URL = 'http://127.0.0.1:5001/predict-dynamic';

export default function AnimalPractise({
  poses,
  animalName,
  animalIcon,
  backRoute,
  minProbability = 0.9,
}) {
  const navigate = useNavigate();

  const HOLD_SECONDS = 30; // seconds user must hold each pose

  /* ── state ── */
  const [phase, setPhase]               = useState('idle');
  const [poseIdx, setPoseIdx]           = useState(0);
  const [landmarkClass, setLandmarkClass] = useState('');
  const [probability, setProbability]   = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);   // 0-100%
  const [holdSecsLeft, setHoldSecsLeft] = useState(HOLD_SECONDS);
  const [handDetected, setHandDetected] = useState(false);
  const [apiError, setApiError]         = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState('');
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionAccuracy, setSessionAccuracy] = useState(0);

  /* ── refs ── */
  const webcamRef      = useRef(null);
  const canvasRef      = useRef(null);
  const cameraRef      = useRef(null);
  const poseIdxRef     = useRef(0);
  const finishRef      = useRef(false);
  const startTimeRef   = useRef(null);
  const probsRef       = useRef([]);
  const apiErrRef      = useRef(false);   // prevent setting error state 30x/sec
  const holdStartRef   = useRef(null);    // when high-confidence hold began
  const holdProgRef    = useRef(0);       // prevent 30x/sec state updates for hold

  const totalPoses = poses.length;

  /* ── cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  /* ── draw hand connectors on canvas ── */
  function drawHand(ctx, landmarks, W, H) {
    // draw connections
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17],
    ];
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth   = 2;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * W, landmarks[a].y * H);
      ctx.lineTo(landmarks[b].x * W, landmarks[b].y * H);
      ctx.stroke();
    }
    // draw dots
    for (const pt of landmarks) {
      ctx.beginPath();
      ctx.arc(pt.x * W, pt.y * H, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /* ── MediaPipe onResults ── */
  async function onResults(results) {
    if (!webcamRef.current?.video || !canvasRef.current) return;

    const video  = webcamRef.current.video;
    const canvas = canvasRef.current;
    const W = video.videoWidth;
    const H = video.videoHeight;
    if (!W || !H) return;

    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // mirror-flip canvas to match mirrored webcam display
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform

    // check hand detection
    const hasHand = !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
    setHandDetected(hasHand);

    if (!hasHand || finishRef.current) {
      ctx.restore();
      return;
    }

    // draw hand skeleton on canvas
    for (const handLandmarks of results.multiHandLandmarks) {
      // mirror the landmark x coords to match flipped canvas
      const mirrored = handLandmarks.map(pt => ({ ...pt, x: 1 - pt.x }));
      drawHand(ctx, mirrored, W, H);
    }
    ctx.restore();

    // flatten landmarks for API
    const landmarks = [];
    for (const hand of results.multiHandLandmarks) {
      for (const pt of hand) {
        landmarks.push(pt.x, pt.y, pt.z);
      }
    }

    if (landmarks.length !== 63) return;

    try {
      const res = await axios.post(API_URL, { temp: landmarks });
      const predicted = res.data.predict;
      const prob      = res.data.probability;

      // clear any prior API error on success
      if (apiErrRef.current) {
        apiErrRef.current = false;
        setApiError('');
      }

      setLandmarkClass(predicted);
      setProbability(prob);
      probsRef.current.push(prob);

      if (prob >= minProbability) {
        // start or continue the hold timer
        if (!holdStartRef.current) holdStartRef.current = Date.now();
        const elapsed  = (Date.now() - holdStartRef.current) / 1000;
        const pct      = Math.min(100, Math.round((elapsed / HOLD_SECONDS) * 100));
        const secsLeft = Math.max(0, Math.ceil(HOLD_SECONDS - elapsed));

        // throttle state updates to ~4/sec
        if (Math.abs(pct - holdProgRef.current) >= 2) {
          holdProgRef.current = pct;
          setHoldProgress(pct);
          setHoldSecsLeft(secsLeft);
        }

        if (elapsed >= HOLD_SECONDS) {
          // held long enough — advance
          holdStartRef.current = null;
          holdProgRef.current  = 0;
          setHoldProgress(0);
          setHoldSecsLeft(HOLD_SECONDS);

          const currIdx = poseIdxRef.current;
          const nextIdx = currIdx + 1;
          poseIdxRef.current = nextIdx;
          setPoseIdx(nextIdx);

          if (nextIdx >= totalPoses) {
            finishRef.current = true;
            handleSessionComplete();
          }
        }
      } else {
        // confidence dropped — reset hold
        if (holdStartRef.current) {
          holdStartRef.current = null;
          holdProgRef.current  = 0;
          setHoldProgress(0);
          setHoldSecsLeft(HOLD_SECONDS);
        }
      }
    } catch (err) {
      if (!apiErrRef.current) {
        apiErrRef.current = true;
        const msg = err.code === 'ERR_NETWORK'
          ? 'Flask API not reachable — make sure python app.py is running on port 5001'
          : `API error: ${err.response?.status || err.message}`;
        setApiError(msg);
      }
    }
  }

  /* ── Start detection ── */
  const startDetection = () => {
    setPhase('detecting');
    finishRef.current    = false;
    poseIdxRef.current   = 0;
    probsRef.current     = [];
    apiErrRef.current    = false;
    startTimeRef.current = Date.now();
    setPoseIdx(0);
    setLandmarkClass('');
    setProbability(0);
    setHandDetected(false);
    setApiError('');

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);

    const videoEl = webcamRef.current?.video;
    if (videoEl) {
      const camera = new cam.Camera(videoEl, {
        onFrame: async () => {
          try {
            if (webcamRef.current?.video) {
              await hands.send({ image: webcamRef.current.video });
            }
          } catch (_) {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
      cameraRef.current = camera;
    }
  };

  /* ── Session complete ── */
  const handleSessionComplete = async () => {
    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch (_) {}
      cameraRef.current = null;
    }

    const durationMin = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 60000)
    );
    const probs   = probsRef.current;
    const avgProb = probs.length > 0
      ? probs.reduce((s, p) => s + p, 0) / probs.length
      : minProbability;

    const score    = 100;
    const accuracy = Math.round(avgProb * 100);

    setSessionScore(score);
    setSessionAccuracy(accuracy);
    setPhase('completed');

    setSaving(true);
    setSaveError('');
    try {
      await GuardianDataService.recordActivity({
        activityName: `Practise ${animalName} Sign`,
        category: 'animalSigns',
        duration: durationMin,
        score,
      });
      await GuardianDataService.recordScore({
        category: 'animalSigns',
        score,
        accuracy,
      });
      await GuardianDataService.checkAchievements();
    } catch (err) {
      console.error('Error saving session:', err);
      setSaveError('Could not save results. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Retry ── */
  const handleRetry = () => {
    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch (_) {}
      cameraRef.current = null;
    }
    finishRef.current  = false;
    poseIdxRef.current = 0;
    probsRef.current   = [];
    apiErrRef.current  = false;
    setPhase('idle');
    setPoseIdx(0);
    setLandmarkClass('');
    setProbability(0);
    setHandDetected(false);
    setApiError('');
    setSaveError('');
  };

  /* ── helpers ── */
  const currentPose = poses[Math.min(poseIdx, totalPoses - 1)];
  const isMatch     = probability >= minProbability;
  const confPct     = Math.round(probability * 100);
  const poseLabel   = currentPose?.name?.replace(/-/g, ' ') || '';

  /* ── Step strip ── */
  const StepStrip = () => (
    <div className="ap-progress-strip">
      {poses.map((p, i) => {
        const done   = i < poseIdx;
        const active = i === poseIdx && phase === 'detecting';
        return (
          <React.Fragment key={p.id}>
            {i > 0 && (
              <div className={`ap-step-line ${done ? 'ap-step-line--done' : ''}`} />
            )}
            <div className={`ap-step-dot ${done ? 'ap-step-dot--done' : active ? 'ap-step-dot--active' : ''}`}>
              {done ? '✓' : i + 1}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ════════ render ════════ */
  return (
    <div className="ap-page">
      <div className="ap-container">

        {/* ── Header ── */}
        <div className="ap-header">
          <div className="ap-header-icon">{animalIcon}</div>
          <div className="ap-header-info">
            <h1>Practise {animalName} Sign</h1>
            <p>Follow the pose shown and hold it steady</p>
          </div>
          <StepStrip />
          <div className="ap-header-actions">
            <button className="ap-btn ap-btn--ghost" onClick={() => navigate(backRoute)}>
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="ap-grid">

          {/* Left: pose reference */}
          <div className="ap-card">
            <div className="ap-card-header">
              <FaCamera /> Target Pose
            </div>
            <div className="ap-card-body">
              <img
                src={currentPose?.image}
                alt={currentPose?.name}
                className="ap-pose-img"
              />
              <div className="ap-pose-name">
                Pose {Math.min(poseIdx, totalPoses - 1) + 1} / {totalPoses}: {poseLabel}
              </div>
            </div>
          </div>

          {/* Middle: webcam + canvas overlay */}
          <div className="ap-card">
            <div className="ap-card-header">
              <FaCamera /> Your Camera
              {phase === 'detecting' && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '20px',
                  background: handDetected ? 'rgba(67,233,123,0.25)' : 'rgba(255,255,255,0.15)',
                  color: handDetected ? '#43e97b' : 'rgba(255,255,255,0.7)',
                }}>
                  {handDetected ? '✋ Hand detected' : '✋ No hand'}
                </span>
              )}
            </div>
            <div className="ap-card-body">
              <div className="ap-cam-wrap">
                {/* webcam hidden underneath — canvas renders on top */}
                <Webcam
                  ref={webcamRef}
                  mirrored
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: phase === 'detecting' ? 0 : 1,
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    display: phase === 'detecting' ? 'block' : 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: status & controls */}
          <div className="ap-card">
            <div className="ap-card-header">Status &amp; Controls</div>
            <div className="ap-card-body">

              {/* API error banner */}
              {apiError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  fontWeight: 500,
                  marginBottom: '0.75rem',
                  display: 'flex',
                  gap: '0.4rem',
                  alignItems: 'flex-start',
                }}>
                  <FaExclamationTriangle style={{ marginTop: '2px', flexShrink: 0 }} />
                  {apiError}
                </div>
              )}

              {/* IDLE */}
              {phase === 'idle' && (
                <div className="ap-status-idle">
                  <div className="ap-status-idle-icon">🤲</div>
                  <h3>Ready to Practice!</h3>
                  <p>
                    Perform {totalPoses} pose{totalPoses > 1 ? 's' : ''} for the {animalName} sign.
                    Make sure your hand is visible in the camera and the Flask API is running.
                  </p>
                  <button
                    className="ap-btn ap-btn--primary ap-btn--lg"
                    onClick={startDetection}
                  >
                    <FaPlay /> Start Practice
                  </button>
                </div>
              )}

              {/* DETECTING */}
              {phase === 'detecting' && (
                <>
                  {/* hand status */}
                  <div className={`ap-hand-status ${handDetected ? 'ap-hand-status--on' : 'ap-hand-status--off'}`}>
                    <FaHandPaper />
                    {handDetected ? 'Hand detected — keep it visible' : 'Place your hand in the camera'}
                  </div>

                  <div className="ap-detect-label" style={{ marginTop: '0.75rem' }}>
                    Detected Sign
                  </div>
                  <div className="ap-detect-sign">{landmarkClass || '–'}</div>

                  <div className="ap-conf-bar-wrap">
                    <div className="ap-conf-bar-label">
                      <span>Confidence</span>
                      <span>{confPct}%</span>
                    </div>
                    <div className="ap-conf-bar-track">
                      <div
                        className={`ap-conf-bar-fill ${confPct >= 90 ? 'ap-conf-bar-fill--high' : confPct < 30 ? 'ap-conf-bar-fill--low' : ''}`}
                        style={{ width: `${confPct}%` }}
                      />
                    </div>
                  </div>

                  <div className={`ap-match-row ${isMatch ? 'ap-match-row--match' : 'ap-match-row--no-match'}`}>
                    {isMatch
                      ? <><FaCheckCircle /> Pose matched! Hold it…</>
                      : <>Target: <strong>{poseLabel}</strong></>
                    }
                  </div>

                  {/* Hold timer — only visible when pose is matched */}
                  {isMatch && (
                    <div className="ap-hold-wrap">
                      <div className="ap-hold-label-row">
                        <span className="ap-hold-label">Hold timer</span>
                        <span className="ap-hold-secs">{holdSecsLeft}s left</span>
                      </div>
                      <div className="ap-hold-track">
                        <div
                          className="ap-hold-fill"
                          style={{ width: `${holdProgress}%` }}
                        />
                      </div>
                      <div className="ap-hold-hint">
                        Keep your hand still for {HOLD_SECONDS} seconds to advance
                      </div>
                    </div>
                  )}

                  <div className="ap-detect-label" style={{ marginTop: '0.75rem' }}>
                    Progress
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#667eea' }}>
                    {poseIdx} / {totalPoses} poses done
                  </div>
                </>
              )}

              {/* COMPLETED */}
              {phase === 'completed' && (
                <div className="ap-complete">
                  <div className="ap-complete-icon">🎉</div>
                  <h3>Great Job!</h3>
                  <p>You successfully practised the {animalName} sign.</p>

                  <div className="ap-score-row">
                    <div className="ap-score-box">
                      <div className="ap-score-box-val">{sessionScore}%</div>
                      <div className="ap-score-box-label">Score</div>
                    </div>
                    <div className="ap-score-box">
                      <div className="ap-score-box-val">{sessionAccuracy}%</div>
                      <div className="ap-score-box-label">Accuracy</div>
                    </div>
                    <div className="ap-score-box">
                      <div className="ap-score-box-val">{totalPoses}</div>
                      <div className="ap-score-box-label">Poses</div>
                    </div>
                  </div>

                  <div className="ap-complete-btns">
                    <button
                      className="ap-btn ap-btn--primary ap-btn--lg"
                      onClick={() => navigate('/dashboard-animals')}
                    >
                      Back to Dashboard
                    </button>
                    <button className="ap-btn ap-btn--ghost" onClick={handleRetry}>
                      <FaRedo /> Try Again
                    </button>
                    <button className="ap-btn ap-btn--ghost" onClick={() => navigate(backRoute)}>
                      <FaArrowLeft /> Back to Learn
                    </button>
                  </div>

                  {saving && (
                    <div className="ap-saving">
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Saving results…
                    </div>
                  )}
                  {saveError && (
                    <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.5rem' }}>
                      {saveError}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

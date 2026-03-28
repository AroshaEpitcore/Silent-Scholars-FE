import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from "./Test";
import { StaticSignData } from "../../../Data/StaticSignData";
import { useNavigate, useParams } from "react-router-dom";
import '../static-signs.css';

let time = 0;
let landmarks = null;

export default function PracticeStaticSign() {
  let navigate = useNavigate();
  const routeLearn = () => navigate("/learn-static-sign");

  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraData, setCameraData] = useState(null);
  const [SignData, setSignData] = useState(StaticSignData);
  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  const { id } = useParams();

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
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);
    if (webcamRef.current) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try { await hands.send({ image: webcamRef.current.video }); } catch (error) {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const stopDetection = () => {
    cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    routeLearn();
  };

  const isMatch       = landmarkClass === SignData[id - 1].name;
  const isGoodMatch   = isMatch && probability > 0.7;
  const isWeakMatch   = isMatch && probability <= 0.7;
  const isNoMatch     = !isMatch && !learn;

  return (
    <div className="ss-page">
      <div className="ss-container">

        {/* Page Header */}
        <div className="ss-page-header">
          <button className="ss-back-btn" onClick={() => window.history.back()}>← Back</button>
          <div>
            <div className="ss-page-title">Static Sign Practice</div>
            <div className="ss-page-subtitle">Match the target sign using your hand</div>
          </div>
          {practice && (
            <div className="ss-header-badge">
              🟢 Detection Active
            </div>
          )}
        </div>

        {/* 3-Column Grid */}
        <div className="ss-grid">

          {/* Col 1 — Target sign */}
          <div className="ss-card">
            <div className="ss-card-header">Target Sign</div>
            <div className="ss-card-body">
              <div className="ss-img-box">
                <img
                  src={SignData[id - 1].alphabetImage}
                  alt={SignData[id - 1].name}
                />
              </div>
              <div className="ss-sign-name">{SignData[id - 1].name}</div>
              <div className="ss-img-label">Try to match this sign</div>
            </div>
          </div>

          {/* Col 2 — Camera */}
          <div className="ss-card">
            <div className="ss-card-header accent">Live Camera</div>
            <div className="ss-card-body">
              <div className="ss-webcam-box">
                {isCameraOn
                  ? <Test webcamRef={webcamRef} canvasRef={canvasRef} />
                  : <div className="ss-webcam-off">Camera is off</div>
                }
              </div>
            </div>
          </div>

          {/* Col 3 — Detection status */}
          <div className="ss-card">
            <div className="ss-card-header success">Detection Status</div>
            <div className="ss-card-body">

              {/* Ready state */}
              {learn && (
                <div className="ss-result-box info">
                  <span className="ss-result-icon">▶️</span>
                  <div className="ss-result-title">Ready to Practice?</div>
                  <div className="ss-result-subtitle">
                    Click below to start hand sign detection
                  </div>
                  <div className="ss-btn-group">
                    <button className="ss-btn-primary" onClick={onClickStart}>
                      Start Practice
                    </button>
                  </div>
                </div>
              )}

              {/* Success */}
              {isGoodMatch && (
                <div className="ss-result-box success">
                  <span className="ss-result-icon">✅</span>
                  <div className="ss-result-title">Great job!</div>
                  <div className="ss-result-subtitle">You're doing it perfectly!</div>
                </div>
              )}

              {/* Almost */}
              {isWeakMatch && (
                <div className="ss-result-box warning">
                  <span className="ss-result-icon">⚠️</span>
                  <div className="ss-result-title">Almost there!</div>
                  <div className="ss-result-subtitle">Try to match the pose more closely</div>
                </div>
              )}

              {/* No match */}
              {isNoMatch && (
                <div className="ss-result-box error">
                  <span className="ss-result-icon">❌</span>
                  <div className="ss-result-title">Try Again!</div>
                  <div className="ss-result-subtitle">Your sign doesn't match yet</div>
                </div>
              )}

              {/* Live prediction */}
              {!learn && (
                <div className="ss-prediction-box">
                  <div className="ss-prediction-label">Detected Sign</div>
                  <div className="ss-prediction-value">{landmarkClass}</div>
                  <div className="ss-progress">
                    <div
                      className="ss-progress-bar"
                      style={{ width: `${probability * 100}%` }}
                    />
                  </div>
                  <div className="ss-confidence-text">
                    Confidence: {(probability * 100).toFixed(0)}%
                  </div>
                  <div className="ss-btn-group">
                    <button className="ss-btn-danger ss-mt-2" onClick={stopDetection}>
                      ← Back to Learning
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

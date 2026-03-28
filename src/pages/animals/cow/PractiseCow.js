import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import Test from "./Test";
import { CowPoses } from "../../../Data/dynamicSign/CowPoses";
import { FaPaw, FaArrowLeft, FaPlay, FaCheckCircle } from "react-icons/fa";
import "../animals.css";

const DONE_STEP = 3;

export default function PractiseCow() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    const [poses] = useState(CowPoses);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    var camera = null;

    const [start, setStart] = useState(true);
    const [detecting, setDetecting] = useState(false);
    const [finish, setFinish] = useState(false);
    const [landmarkClass, setLandmarkClass] = useState("none");
    const [probability, setProbability] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [currentPose, setCurrentPose] = useState(0);

    const onClickStart = () => {
        setStart(false);
        setDetecting(true);
        startDetection();
    };

    const routeResult = () => navigate("/result");

    async function onResults(results) {
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
        canvasCtx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

        let totalLandmarks = [];
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                await landmarks.map((item) => {
                    totalLandmarks.push(item.x);
                    totalLandmarks.push(item.y);
                    totalLandmarks.push(item.z);
                });
            }
            if (totalLandmarks.length === 63) {
                const result = await axios.post("http://127.0.0.1:5000/predict-test", { temp: totalLandmarks });
                setLandmarkClass(result.data.predict);
                setProbability(result.data.probability);
                if (result.data.probability > 0.9 && currentStep < DONE_STEP && poses[currentPose].name === result.data.predict && !finish) {
                    setCurrentStep(s => s + 1);
                    setCurrentPose(p => p + 1);
                }
                if (result.data.probability > 0.9 && currentStep < DONE_STEP && result.data.predict === "cow-pose-2") {
                    setCurrentStep(DONE_STEP);
                    setFinish(true);
                    stopDetection();
                }
            }
        }
        canvasCtx.restore();
    }

    const startDetection = () => {
        const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        hands.onResults(onResults);
        if (webcamRef.current) {
            camera = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => { try { await hands.send({ image: webcamRef.current.video }); } catch (e) {} },
                width: 640, height: 480,
            });
            camera.start();
        }
    };

    const stopDetection = () => {
        if (camera) camera.stop();
        routeResult();
    };

    const probPct = Math.round((landmarkClass === poses[Math.min(currentPose, poses.length - 1)]?.name ? probability : 0) * 100);
    const isDone = currentStep >= DONE_STEP;

    return (
        <div className="an-page">
            <div className="an-container">

                <div className="an-breadcrumb">
                    <Link to="/dashboard-animals">{t("DynamicSign")}</Link>
                    <span className="an-breadcrumb-sep">›</span>
                    <Link to="/learn-cow">{t("learnCow")}</Link>
                    <span className="an-breadcrumb-sep">›</span>
                    <span className="an-breadcrumb-current">{t("practise")}</span>
                </div>

                <div className="an-steps">
                    {poses.map((pose, i) => (
                        <div className="an-step" key={pose.id}>
                            <div className="an-step-wrapper">
                                <div className={`an-step-dot ${currentStep === i + 1 && !isDone ? "active" : currentStep > i + 1 ? "done" : ""}`}>
                                    {currentStep > i + 1 ? <FaCheckCircle /> : i + 1}
                                </div>
                                <div className="an-step-label">{t("poseLabel", { n: i + 1 })}</div>
                            </div>
                            {i < poses.length - 1 && <div className={`an-step-line ${currentStep > i + 1 ? "done" : ""}`} />}
                        </div>
                    ))}
                    <div className="an-step">
                        <div className={`an-step-line ${isDone ? "done" : ""}`} />
                        <div className="an-step-wrapper">
                            <div className={`an-step-dot ${isDone ? "done" : ""}`}>{isDone ? "✓" : poses.length + 1}</div>
                            <div className="an-step-label">{t("done")}</div>
                        </div>
                    </div>
                </div>

                <div className="an-practice-grid">
                    <div className="an-card">
                        <div className="an-card-header"><FaPaw /> {t("referencePose")}</div>
                        <div className="an-card-body">
                            <img className="an-pose-img" src={poses[Math.min(currentPose, poses.length - 1)].image} alt={poses[Math.min(currentPose, poses.length - 1)].name} />
                            <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem", color: "#718096", fontWeight: 600 }}>
                                {poses[Math.min(currentPose, poses.length - 1)].name}
                            </div>
                        </div>
                    </div>

                    <div className="an-card">
                        <div className="an-card-header accent">📷 {t("liveCamera")}</div>
                        <div className="an-card-body">
                            <div className="an-webcam-box">
                                <Test webcamRef={webcamRef} canvasRef={canvasRef} />
                            </div>
                        </div>
                    </div>

                    <div className="an-card">
                        <div className="an-card-header success">📊 {t("status")}</div>
                        <div className="an-card-body">
                            {start && (
                                <div className="an-status-panel">
                                    <div className="an-start-icon">🖐️</div>
                                    <div className="an-start-title">{t("readyToPractice")}</div>
                                    <div className="an-start-desc">{t("practiceDesc")}</div>
                                    <button className="an-btn-start" onClick={onClickStart}><FaPlay /> {t("startDetection")}</button>
                                </div>
                            )}
                            {detecting && !isDone && (
                                <div className="an-status-panel">
                                    <div className="an-detecting" style={{ width: "100%" }}>
                                        <div className="an-sign-label">{t("currentSign")}</div>
                                        <div className="an-sign-name">{poses[Math.min(currentPose, poses.length - 1)].name}</div>
                                        <div className="an-prob-row"><span>{t("confidence")}</span><span>{probPct}%</span></div>
                                        <div className="an-prob-track">
                                            <div className={`an-prob-fill ${probPct >= 90 ? "good" : ""}`} style={{ width: `${probPct}%` }} />
                                        </div>
                                        <div className="an-hint">{t("holdPoseHint")}</div>
                                    </div>
                                </div>
                            )}
                            {isDone && (
                                <div className="an-status-panel">
                                    <div className="an-success-icon">🎉</div>
                                    <div className="an-success-title">{t("ssGreatJob")}</div>
                                    <div className="an-success-desc">{t("practiceComplete")}</div>
                                    <button className="an-btn-back" onClick={() => navigate("/learn-cow")}>{t("backToLearn")}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="an-actions">
                    <button className="an-btn-outline" onClick={() => navigate("/learn-cow")}><FaArrowLeft /> {t("backToLearn")}</button>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useRef } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Button, Result, PageHeader, Image } from 'antd';
import { Col, Row } from 'antd';
import Test from './Test';
import { StaticSignData } from '../../../Data/StaticSignData';
import { SmileOutlined, SendOutlined, PlayCircleOutlined, VideoCameraOutlined, FrownOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from "react-router-dom";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import { db } from '../../../firebase'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth } from "../../../firebase";

let go = 0;

export default function StaticSignGame() {

  // navigate to learn static sign page
  let navigate = useNavigate();
  const routeLeaderboard = () => {
    let path = `/leaderboard`;
    navigate(path);
  }

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
  const [SignData, setSignData] = useState(StaticSignData);

  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  //use state for current step
  const [currentStep, setCurrentStep] = React.useState(0);

  const stopDetection = () => {
    // camera.stop();
    cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    calculateScore();
    routeLeaderboard();
  };

  const [totalMarks, setTotalMarks] = useState(100); // State for total marks
  const [startTime, setStartTime] = useState(null); // State to track the start time
  const [timeSpent, setTimeSpent] = useState(0); // State to track the total time spent

  //on click start learning
  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    startDetection();
    setStartTime(Date.now());
  };

  //calculate score
  const calculateScore = async () => {
    const user = auth.currentUser; // Get current user

    const endTime = Date.now(); // Calculate the end time
    const elapsedTime = endTime - startTime; // Calculate the elapsed time
    setTimeSpent(elapsedTime / 1000); // Convert time to seconds

    if (user) {
      try {
        // Save the total marks and time spent to Firestore
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          score: totalMarks, // Save total marks
          // time: timeSpent // Save time spent
        }, { merge: true }); // Use merge to update without overwriting

        // Record activity and score for Guardian Dashboard
        const GuardianDataService = (await import('../../../services/GuardianDataService')).default;
        
        // Record activity
        await GuardianDataService.recordActivity({
          activityName: 'Completed Static Signs Lesson',
          category: 'Static Signs',
          duration: Math.round(elapsedTime / 1000 / 60), // Convert to minutes
          score: totalMarks
        });

        // Record score
        await GuardianDataService.recordScore({
          score: totalMarks,
          category: 'staticSigns',
          accuracy: Math.round((totalMarks / 100) * 100), // Assuming max score is 100
          lessonType: 'Static Signs'
        });

        // Check for achievements
        await GuardianDataService.checkAchievements();

        // Create performance alert if accuracy is low
        const accuracy = Math.round((totalMarks / 100) * 100);
        await GuardianDataService.createPerformanceAlert(user.uid, 'Static Signs', accuracy);

        // Create milestone notification for first lesson
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
    // console.log(results)

    // const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
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
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5
        });
        connect(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

        await landmarks.map((item) => {
          totalLandmarks.push(item.x);
          totalLandmarks.push(item.y);
          totalLandmarks.push(item.z);
        });
      }
      const data = {
        // filename: 'test.csv',
        // className: 'Five'.toString(),
        temp: totalLandmarks
      };

      if (totalLandmarks.length === 63) {
        const result = await axios.post('http://127.0.0.1:5000/predict-static-sign', data);
        setLandmarkClass(result.data.predict);
        setProbability(result.data.probability);
        console.log(SignData[currentStep].name);
        console.log(result.data);
        console.log(currentStep);
        if (result.data.predict === 'A' && result.data.probability > 0.5 && go == 0) {
          go = 1;
        } else if (result.data.predict === 'B' && result.data.probability > 0.5 && go == 1) {
          go = 2;
        }
        else if (result.data.predict === 'C' && result.data.probability > 0.5 && go == 2) {
          go = 3;
        }
        else if (result.data.predict === 'D' && result.data.probability > 0.5 && go == 3) {
          go = 4;
        } else if (result.data.predict === 'E' && result.data.probability > 0.5 && go == 4) {
          setResult(true);
        }
      }
    }

    //extract hand landmarks

    canvasCtx.restore();
  }
  // }

  const startDetection = () => {
    // handleLeftDrawerToggle();
    setIsStarted(true);
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try {
            await hands.send({ image: webcamRef.current.video });
          } catch (error) { }
        },
        width: 640,
        height: 480
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const nextStep = () => {
    setTotalMarks(totalMarks - 20); // Deduct 20 marks for each wrong answer
    go = go + 1
  }


  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={() => null}
        title="Static Sign"
        subTitle="Learn a static sign"
        style={{ border: '1px solid rgb(235, 237, 240)' }}
      />
      <Row justify="center" align="middle" style={{ marginTop: '50px' }}>
        <Col span={8} align="center" justify="center">
          <Image
            width={300}
            src={SignData[go].alphabetImage}
          />
        </Col>
        <Col span={8} align="center" justify="center">
          {isCameraOn && <Test webcamRef={webcamRef} canvasRef={canvasRef} />}
        </Col>
        <Col span={8} align="center" justify="center">
          {learn && (

            <Result
              icon={<PlayCircleOutlined />}
              title="Start Game"
              extra={<Button type="primary" onClick={onClickStart}>Start</Button>}
            />
          )}
          {/* Try next sign */}
          {!learn && currentStep < SignData.length - 1 && !result && (
            <Button type="primary" onClick={nextStep}>Try Next Sign</Button>
          )}

          {result && (
            <Result
              status="success"
              title="Finished"
              extra={

                <Button key="console" type="primary" onClick={() => stopDetection()}>
                  Done
                </Button>
              }
            />
          )}

        </Col>
      </Row>
    </>
  );
}
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyncLoader, ScaleLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { FaFont, FaUpload, FaMicrophone, FaPlay } from "react-icons/fa";
import "./text-sign.css";

export default function TextSign() {
  const { t } = useTranslation("common");
  const [usefulWords, setUsefulWords] = useState([]);
  const [file, setFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null); // "file" | "voice"

  const getPdfUsefulWords = async () => {
    try {
      const res = await axios.get("/pdfScan");
      setUsefulWords(res.data.useful_words);
      toast.success(t("PDFScanSuccessful"));
    } catch {
      toast.error(t("PDFScanError"));
    }
  };

  const getAudioUsefulWords = async () => {
    try {
      const res = await axios.get("/audioExtraction");
      setUsefulWords(res.data.useful_words);
      toast.success(t("AudioExtractSuccessful"));
    } catch (error) {
      console.log(error);
      toast.error(t("AudioExtractionError"));
    }
  };

  const handleSelectFile = (e) => setFile(e.target.files[0]);

  const handleUploadFile = async () => {
    if (!file) { toast.error(t("Pleaseuploadafile")); return; }
    setIsFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const ext = file.name.split(".").pop();
    try {
      await axios.post("/upload", formData);
      setIsFileLoading(false);
      toast.success(t("FileUploadSuccessful"));
      if (ext === "pdf") getPdfUsefulWords();
      if (ext === "m4a") getAudioUsefulWords();
    } catch {
      setIsFileLoading(false);
      toast.error(t("FileUploadError"));
    }
  };

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
    setIsVoiceLoading(true);
  };
  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsVoiceLoading(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!transcript) { toast.error(t("Pleasestartrecording")); return; }
    axios.post("/typeSentence", { sentence: transcript })
      .then((res) => { setUsefulWords(res.data.useful_words); toast.success(t("VoiceExtractionSuccessful")); })
      .catch(() => toast.error(t("VoiceExtractionError")));
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>{t("browserNoSpeech")}</span>;
  }

  return (
    <div className="ts2-page">
      <ToastContainer position="bottom-center" theme="colored" autoClose={2000} />
      <div className="ts2-container">

        <div className="ts2-breadcrumb">
          <Link to="/dashboard">{t("dashboard")}</Link>
          <span className="ts2-breadcrumb-sep">›</span>
          <span className="ts2-breadcrumb-current">{t("textToSign")}</span>
        </div>

        <div className="ts2-hero">
          <div className="ts2-hero-icon"><FaFont /></div>
          <div>
            <div className="ts2-hero-title">{t("textToSign")}</div>
            <div className="ts2-hero-sub">{t("textToSignDescription")}</div>
          </div>
        </div>

        <div className="ts2-grid">

          {/* Input card */}
          <div className="ts2-card">
            <div className="ts2-card-header">
              <FaUpload /> {t("UploadFile")} / <FaMicrophone /> {t("VoiceRecording")}
            </div>
            <div className="ts2-card-body">

              <div className="ts2-method-btns">
                <button
                  className={`ts2-method-btn ${activeMethod === "file" ? "active" : ""}`}
                  onClick={() => setActiveMethod(activeMethod === "file" ? null : "file")}
                >
                  <FaUpload /> {t("UploadFile")}
                </button>
                <button
                  className={`ts2-method-btn ${activeMethod === "voice" ? "active" : ""}`}
                  onClick={() => setActiveMethod(activeMethod === "voice" ? null : "voice")}
                >
                  <FaMicrophone /> {t("VoiceRecording")}
                </button>
              </div>

              {activeMethod === "file" && (
                <div className="ts2-input-panel">
                  <div className="ts2-file-row">
                    <input
                      type="file"
                      onChange={handleSelectFile}
                      className="ts2-file-input"
                      id="fileInput"
                    />
                    <button className="ts2-btn-convert" onClick={handleUploadFile}>
                      {t("convertToSign")}
                    </button>
                  </div>
                  {isFileLoading && (
                    <div className="ts2-loader">
                      <SyncLoader loading={isFileLoading} color="#667eea" size={8} />
                    </div>
                  )}
                </div>
              )}

              {activeMethod === "voice" && (
                <div className="ts2-input-panel">
                  <div className="ts2-mic-status">
                    <div className={`ts2-mic-dot ${listening ? "listening" : ""}`} />
                    {t("microphone")}: {listening ? t("on") : t("off")}
                  </div>
                  <div className="ts2-voice-controls">
                    <button className="ts2-btn-mic start" onClick={startListening}>{t("start")}</button>
                    <button className="ts2-btn-mic stop" onClick={stopListening}>{t("stop")}</button>
                    <button className="ts2-btn-mic reset" onClick={resetTranscript}>{t("reset")}</button>
                  </div>
                  <textarea
                    readOnly
                    className="ts2-transcript"
                    placeholder={t("saySomething")}
                    value={transcript}
                  />
                  <button className="ts2-btn-convert" onClick={onSubmit}>
                    {t("convertToSign")}
                  </button>
                  {isVoiceLoading && (
                    <div className="ts2-loader">
                      <ScaleLoader loading={isVoiceLoading} color="#667eea" height={20} />
                    </div>
                  )}
                </div>
              )}

              {activeMethod === null && (
                <div className="ts2-empty">
                  <div className="ts2-empty-icon">👆</div>
                  <div className="ts2-empty-text">{t("PleaseClickUploadFileOrVoiceRecording")}</div>
                </div>
              )}

            </div>
          </div>

          {/* Results card */}
          <div className="ts2-card">
            <div className="ts2-card-header success">
              🤟 {t("convertToSign")}
            </div>
            <div className="ts2-card-body">
              {usefulWords.length > 0 ? (
                <ul className="ts2-words-list">
                  {usefulWords.map((word) => (
                    <li className="ts2-word-item" key={word}>
                      {word}
                      <button className="ts2-word-play">
                        <img
                          src="https://img.icons8.com/ios-glyphs/20/ffffff/play--v1.png"
                          alt="play"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="ts2-empty">
                  <div className="ts2-empty-icon">🤟</div>
                  <div className="ts2-empty-text">{t("PleaseClickUploadFileOrVoiceRecording")}</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

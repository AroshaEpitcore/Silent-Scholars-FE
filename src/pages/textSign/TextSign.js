import React, { useState } from "react";
import axios from "axios";
import { useSpeechRecognition } from "react-speech-recognition";
import FileUpload from "../../components/texttosign/FileUpload";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyncLoader } from "react-spinners";
import { FaFileAlt, FaHandPaper, FaUpload, FaLanguage } from "react-icons/fa";
import { getSinhala, isSinhalaWord, getEnglishFromSinhala } from "../../Data/EnglishToSinhala";
import "./TextSign.css";

export default function TextSign() {
  const [usefulWords, setUsefulWords] = useState([]);
  const [file, setFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const { browserSupportsSpeechRecognition } = useSpeechRecognition();

  const getPdfUsefulWords = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5001/pdfScan");
      setUsefulWords(res.data.useful_words);
      setTranslations({});
      toast.success("PDF scanned successfully!");
    } catch (error) {
      toast.error("PDF scan failed. Please try again.");
    }
  };

  const handleSelectFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setIsFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const fileExtension = file.name.split(".").pop().toLowerCase();

    try {
      await axios.post("http://127.0.0.1:5001/upload", formData);
      toast.success("File uploaded successfully!");
      if (fileExtension === "pdf") {
        await getPdfUsefulWords();
      } else {
        toast.error("Only PDF files are supported.");
      }
    } catch (err) {
      toast.error("File upload failed. Please try again.");
    } finally {
      setIsFileLoading(false);
    }
  };

  const translateAll = async () => {
    if (usefulWords.length === 0) return;
    setIsTranslating(true);
    toast.info("Translating words to Sinhala...");

    const results = {};
    for (const word of usefulWords) {
      // Use dictionary first, then API for unknown words
      const dictResult = getSinhala(word);
      if (dictResult) {
        results[word] = dictResult;
        continue;
      }
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|si`
        );
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          results[word] = data.responseData.translatedText;
        }
      } catch {
        // skip failed word
      }
    }

    setTranslations(results);
    setIsTranslating(false);
    toast.success("Translation complete!");
  };

  return (
    <div className="ts-page">
      <ToastContainer position="bottom-center" theme="colored" autoClose={2000} />

      {/* Hero */}
      <div className="ts-hero">
        <div className="ts-hero-icon"><FaHandPaper /></div>
        <h1 className="ts-hero-title">Text to Sign</h1>
        <p className="ts-hero-subtitle">Upload a PDF and convert its words into sign language</p>
      </div>

      <div className="ts-body">

        {/* Upload Card */}
        <div className="ts-upload-card">
          <div className="ts-upload-header">
            <FaUpload className="ts-upload-icon" />
            <h2>Upload PDF</h2>
          </div>
          <p className="ts-upload-hint">Select a PDF file to extract and display its words as sign language references.</p>
          <FileUpload handleSelectFile={handleSelectFile} handleUploadFile={handleUploadFile} />
          {isFileLoading && (
            <div className="ts-loader">
              <SyncLoader color="#6c63ff" size={10} />
              <span>Processing PDF...</span>
            </div>
          )}
        </div>

        {/* Results */}
        {usefulWords.length > 0 && (
          <div className="ts-results">
            <div className="ts-results-header">
              <div className="ts-results-title">
                <FaFileAlt />
                <h2>Extracted Words <span className="ts-badge">{usefulWords.length}</span></h2>
              </div>
              <button
                className="ts-translate-btn"
                onClick={translateAll}
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <>
                    <SyncLoader color="#fff" size={6} />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <FaLanguage />
                    <span>Translate to Sinhala</span>
                  </>
                )}
              </button>
            </div>

            <div className="ts-words-grid">
              {usefulWords.map((word) => {
                const isSinhala = isSinhalaWord(word);
                // For Sinhala words: find English equivalent from reverse map
                const englishEquiv = isSinhala ? getEnglishFromSinhala(word) : null;
                // Sinhala label to show: if English word → look up translation; if Sinhala word → it IS the Sinhala
                const sinhalaLabel = isSinhala ? word : (translations[word] || getSinhala(word));
                // English label to show
                const englishLabel = isSinhala ? (englishEquiv || word) : word;

                return (
                  <div
                    className={`ts-word-card ${sinhalaLabel ? "ts-word-card--translated" : ""} ${isSinhala ? "ts-word-card--sinhala-input" : ""}`}
                    key={word}
                  >
                    <FaHandPaper className="ts-word-icon" />
                    <span className="ts-word-text">{englishLabel}</span>
                    {sinhalaLabel && !isSinhala && (
                      <span className="ts-word-sinhala">{sinhalaLabel}</span>
                    )}
                    {isSinhala && (
                      <span className="ts-word-sinhala ts-word-sinhala--original">{word}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {usefulWords.length === 0 && !isFileLoading && (
          <div className="ts-empty">
            <FaFileAlt className="ts-empty-icon" />
            <p>Upload a PDF to see extracted words here</p>
          </div>
        )}
      </div>
    </div>
  );
}

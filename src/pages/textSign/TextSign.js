import React, { useState } from "react";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import FileUpload from "../../components/texttosign/FileUpload";
import Speech from "../../components/texttosign/Speech";
import UserFulWord from "../../components/texttosign/UserFulWord";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyncLoader } from "react-spinners";
import { ScaleLoader } from "react-spinners";
import { useTranslation } from "react-i18next";

export default function TextSign() {
  const { t } = useTranslation("common");
  const [usefulWords, setUsefulWords] = useState([]);
  const [file, setFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);

  const [isFileClicked, setIsFileClicked] = useState(false);
  const [isVoiceClicked, setIsVoiceClicked] = useState(false);

  const fileClicked = () => {
    setIsFileClicked(true);
    setIsVoiceClicked(false);
  }

  const voiceClicked = () => {
    setIsVoiceClicked(true);
    setIsFileClicked(false);
  }

  const getPdfUsefulWords = async () => {
    try {
      await axios.get("/pdfScan").then((res) => {
        setUsefulWords(res.data.useful_words);
        toast.success(t("PDFScanSuccessful"));
      });
    } catch (error) {
      toast.error(t("PDFScanError"));
    }
  };

  const getAudioUsefulWords = async () => {
    try {
      await axios.get("/audioExtraction").then((res) => {
        setUsefulWords(res.data.useful_words);
        toast.success(t("AudioExtractSuccessful"));
      });
    } catch (error) {
      console.log(error);
      toast.error(t("AudioExtractionError"));
    }
  };

  const handleSelectFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (file === null) {
      toast.error(t("Pleaseuploadafile"));
    } else {
      setIsFileLoading(true);
    }

    const formData = new FormData();
    formData.append("file", file);
    const fileExtension = file.name.split(".").pop();

    await axios
      .post("/upload", formData)
      .then((res) => {
        setIsFileLoading(false);
        toast.success(t("FileUploadSuccessful"));
        if (fileExtension === "pdf") {
          getPdfUsefulWords();
        }
        if (fileExtension === "m4a") {
          getAudioUsefulWords();
        }
      })
      .catch((err) => {
        toast.error(t("FileUploadError"));
      });
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
  }

  const stopListening = () => {
      SpeechRecognition.stopListening();
      setIsVoiceLoading(false);
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const onSubmit = (e) => {
    e.preventDefault();

    const input_Sentence = {
      sentence: transcript,
    };

    if (input_Sentence.sentence === "") {
      toast.error(t("Pleasestartrecording"));
    }
    if (input_Sentence.sentence !== "" && usefulWords.length === 0) {
      toast.error(t("Nousefulwordsfound"));
    }
    axios
      .post("/typeSentence", input_Sentence)
      .then((res) => {
        setUsefulWords(res.data.useful_words);
        toast.success(t("VoiceExtractionSuccessful"))
      })
      .catch((err) => {
        toast.error(t("VoiceExtractionError"))
      });
  };


  return (
    <>
      <div className="container">
        <div className="row d-flex align-items-center justify-content-center">
          <ToastContainer
            position="bottom-center"
            theme="colored"
            autoClose={2000}
          />
          <div className="col-md-6">
            {/* add colapse */}
            <div className="d-grid mb-4">
              <button
                className="btn btn-success mb-3"
                type="button"
                onClick={fileClicked}
              >
                {t("UploadFile")}
              </button>
              {isFileClicked && (
              <>
                <FileUpload
                  handleSelectFile={handleSelectFile}
                  handleUploadFile={handleUploadFile}
                />
                <SyncLoader loading={isFileLoading} color="purple" />
              </>
              )}

              <button
                className="btn btn-dark mt-5 mb-2"
                type="button"
                onClick={voiceClicked}
              >
                {t("VoiceRecording")}
              </button>
              {isVoiceClicked && (
                <>
                <Speech
                  onSubmit={onSubmit}
                  transcript={transcript}
                  listening={listening}
                  resetTranscript={resetTranscript}
                  startListening={startListening}
                  stopListening={stopListening}
                />
                <ScaleLoader loading={isVoiceLoading} color="purple" />
              </>
              )}
            </div>

            <UserFulWord usefulWords={usefulWords} />
          </div>
          <div className="col-md-6">
            <img
              src="https://1.bp.blogspot.com/-YQyl46fmJN8/XpJ5y0N39MI/AAAAAAABADc/pE0daFBPKe4egq46JW5rt0hSGyUXaWVlgCLcBGAsYHQ/s1600/giphy%2B%25281%2529.gif"
              alt="textSign"
              width="700vh"
              height="700vh"
            />
          </div>
        </div>
      </div>
    </>
  );
}

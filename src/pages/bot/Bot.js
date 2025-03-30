import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Chatbot from "../../components/chatbot/ChatBot";
import { ChatBotData } from "../../Data/ChatBotData";

export default function Bot() {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState("");
  const [botMessage, setBotMessage] = useState("");
  const [humanMessage, setHumanMessage] = useState("");

  const onInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleInput = () => {
    setHumanMessage(message);

    let welcome = ["hello|hi|hey|sup|yo|wassup|whats up|what's up|what's up?"];
    let words2 = new RegExp(welcome);

    if (words2.test(message)) {
    if(!isActive){
      setBotMessage("Typing...");

      setTimeout(() => {
        setBotMessage("Hello How are you?");
        setIsActive(true);
        setMessage("");
      }, 2000);
      toast.success("Welcome to the chatbot");
    }
    else{
        setHumanMessage("");
        setMessage("");
        toast.info("You are already active");
    }
    }

    let bye = ["bye|goodbye|see you later|see you"];
    let words3 = new RegExp(bye);
    if (words3.test(message)) {
      if (isActive) {
        setBotMessage("Typing...");

        setTimeout(() => {
          setBotMessage("Bye, see you later");
          setMessage("");
        }, 2000);
        toast.success("You have left the conversation");

        setTimeout(() => {
          setIsActive(false);
        }, 4000);
      } else {
        setHumanMessage("");
        setMessage("");
        toast.error("You already left the chat");
      }
    }

    {
      ChatBotData.map((data) => {
        let wordsData = data.words;
        let words = new RegExp(wordsData);
        if (words.test(message)) {
          if (isActive) {
            setBotMessage("Typing...");

            setTimeout(() => {
              setBotMessage(data.message);
              setMessage("");
            }, 2000);
          } else {
            setHumanMessage("");
            setMessage("");
            toast.error("Please activate the chatbot");
          }
        }
      });
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-center"
        theme="colored"
        autoClose={2000}
      />
      <Chatbot
        onInputChange={onInputChange}
        handleInput={handleInput}
        isActive={isActive}
        botMessage={botMessage}
        humanMessage={humanMessage}
        message={message}
      />
    </>
  );
}

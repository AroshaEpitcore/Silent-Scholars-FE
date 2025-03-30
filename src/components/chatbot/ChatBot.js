import React from 'react';
import './chatbot.css';
import { BsDot } from 'react-icons/bs';
import { FaPaperPlane } from 'react-icons/fa';

export default function ChatBot({ onInputChange, handleInput, isActive, botMessage, humanMessage, message }) {
  return (
    <div className='chatbot'>
        <div className='Wrapper'>
            <div className='content'>
                <div className='header'>
                    <div className='img'>
                        <img src='https://st3.depositphotos.com/8950810/17657/v/600/depositphotos_176577870-stock-illustration-cute-smiling-funny-robot-chat.jpg' alt='chatbot' />
                    </div>
                    <div className='right'>
                        <div className='name'>ChatBot</div>
                        <div className='status'>
                        {isActive ? (
                                <span><BsDot size={40} color="green" />Active</span>
                            ) : (
                                <span><BsDot size={40} color="red" />Inactive</span>
                            )}    
                        </div>  
                    </div>
                </div>
                <div className='main_new'>
                    <div className='main_new_content'>
                        <div className='messages'>
                            <div className='bot-message' id='message1'>{botMessage}</div>
                            <div className='human-message' id='message2'>{humanMessage}</div>
                        </div>
                    </div>
                </div>
                <div className='bottom'>
                    <div className='btm'>
                        <div className='input'>
                            <input type='text' id="input" onChange={onInputChange} value={message} placeholder='Type your message here' />
                        </div>
                        <div className='btn'>
                                <button onClick={handleInput} id="send"><FaPaperPlane style={{ "marginLeft": "5px", "marginRight": "5px" }} />Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

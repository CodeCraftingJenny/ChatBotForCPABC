import React, { useEffect, useRef, useState } from 'react'
import ChatbotIcon from './components/ChatbotIcon'
import ChatForm from './components/ChatForm'
import ChatMessage from './components/ChatMessage';
import { supportManual } from './components/supportManual.js';

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: "system",
      text: "Welcome to the CPABC IT Support Chatbot! This chatbot is designed to assist co-op students with IT-related questions from the External IT Support Manual.\n\nBegin chatting by typing your question, and the chatbot will provide answers based on the manual’s content."
    },
    {
      hideInChat: true,
      role: "system",
      text: supportManual
    }
  ]);

  const [maximizeChatbot, setMaximizeChatbot] = useState([false]);
  const [showChatbot, setShowChatBot] = useState([false]);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev =>
        [...prev.filter(msg => msg.text !== "Thinking..."), { role: "system", text, isError }]
      );
    };

    const userQuestion = history[history.length - 1]?.text || "";

    const messages = [
      {
        role: "system",
        content: `You are a helpful IT support assistant for CPABC. Use only the following manual content to answer the user's question. Do not generate extra content or redirect users elsewhere. Only respond with exact content from the manual.Include the URL if available. \n\n${supportManual}`
      },
      {
        role: "user",
        content: userQuestion
      }
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.68,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      console.log("Azure OpenAI response:", data);
      if (!response.ok) throw new Error(data.error?.message || "Something went wrong!");

      const reply = data.choices[0].message.content?.trim() || "No reply received.";
      updateHistory(reply);
    } catch (err) {
      updateHistory(err.message, true);
    }
  };


  useEffect(() => {
    //autoscroll
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatBot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">chat</span>
      </button>

      <div className={`chatbot-popup ${maximizeChatbot ? "maximized" : ""}`}>
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">
              Jen AI | Co-op Pilot
            </h2>
          </div>
          <div className='chat-header-buttons'>
            <button
              onClick={() => setMaximizeChatbot(prev => !prev)}
              className="material-symbols-rounded"
              title={maximizeChatbot ? "Minimize" : "Maximize"}
            >
              {maximizeChatbot ? "fullscreen_exit" : "fullscreen"}
            </button>
            <button
              onClick={() => {
                setShowChatBot(prev => !prev);
                setMaximizeChatbot(false);
              }}
              className="material-symbols-rounded"
              title="Close"
            >
              keyboard_arrow_down
            </button>
          </div>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            {/*}
          <ChatbotIcon />
            <p className="message-text">
            </p>
                */}
          </div>

          {/* Renders chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}

        </div>

        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  )
}

export default App
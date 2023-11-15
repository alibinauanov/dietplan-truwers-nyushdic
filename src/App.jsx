import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'

function App() {
  const API_KEY = ''; // put your key
  const [type, setType] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: 'Hello, I am your personal diet assistant!',
      sender: 'Diet Assistant' 
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: 'user',
      direction: 'outgoing',
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setType(true);
    await processMessageToChat(newMessages);
  };

  async function processMessageToChat(chatmessages) {
    let apiMessages = chatmessages.map((messgeObject => {
      let role = ''
      if (messgeObject.sender === 'Diet Assistant') {
        role = 'assistant'
      } else {
        role = 'user'
      }
      return {role: role, content: messgeObject.message}
    }))

    //Fine-tuning and prompt here
    const prompt = 'Provide the approximate calories and protein content for a meal in the following format: {food name}:{amount of food in gram},{calories},{protein}. Requirements: 1, I want only the data, no extra words should be generated. 2, The result only have to be approximated, just give what you have, I don not need it to be 100% accurate 3, If the description of the meal is valid, put "success" before the data, else, put "failure". 4, You need to analyzed the description of the meal and return the data for all food mentioned. \
    For example, I wrote "I ate a small plate of chocolate cake", and you shall return the foramatted data with your estimation of "a small plate", and calculate its approximate value in calory and protein, and return it in the formate I gave you.\
    Reply clear if you understand the prompt'
    const SystemMessages = {
      role: 'system',
      content: prompt
    }
    const apiRequestBody = {
      'model': 'gpt-3.5-turbo',
      'messages': [
        SystemMessages,
        ...apiMessages
      ]
    }

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': "Bearer " + API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    })
      .then((data) => data.json())
      .then((data) => {
        const responseContent = data.choices[0]?.message?.content || '';
        
        // update state with the response from the API
        const responseMessage = {
          message: responseContent,
          sender: 'Diet Assistant',
        };

        const updatedMessages = [...chatmessages, responseMessage];
        setMessages(updatedMessages);
      });
  }
//update message state
//send it over to chat
  return (
    <div className='App'>
      <div style={{position: 'relative', height: '700px', width: '700px'}}>
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages.map((message, i)=>{
                return <Message key={i} model={message} className='responseText'/>
              })}
            </MessageList>
            <MessageInput placeholder='Type in the food you ate' onSend={handleSend} className='inputText'/>
              
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App

'use client' // TODO: see what can keep server side

import React, { useEffect, useRef, useState } from 'react';

import Markdown from 'react-markdown'

interface Message {
  direction: "out" | "in";
  text: string;
}

const TEST_MESSAGES: Message[] = [
  {direction: "out", text: "Where did I see that app that lets you create 3d models using generative AI?"},
  {direction: "in", text: "It was mentioned in the references about Luma AI. They are building a multimodal AI to expand human imagination and capabilities. You can find more information on their website. Here is the [link](https://lumalabs.ai)."},
]

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([] as Message[])
  const [sendEnabled, setSendEnabled] = useState(true)

  const messagesRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (!sendEnabled) {
      console.log("Ignoring send request")
      return
    }
    console.log('Searching for:', query);
    let queryMessage: Message = {
      direction: "out",
      text: query,
    }
    setSendEnabled(false)
    setMessages([...messages, queryMessage])
    setQuery("")
    scrollToBottom();
    let encodedMessages = JSON.stringify([...messages, queryMessage])
    const eventSource = new EventSource(`http://localhost:3001/api/query?encoded=${encodeURIComponent(encodedMessages)}`);
    let completion = ""
    eventSource.onmessage = function(event) {
        const eventData = JSON.parse(event.data);
        if (eventData.part.text) {
          completion += eventData.part.text
        }
        if (eventData.part.done) {
          eventSource.close()
          setSendEnabled(true)
        }
        let responseMessage: Message = {
          direction: "in",
          text: completion,
        }
        setMessages([...messages, queryMessage, responseMessage])
    };
  };

  const scrollToBottom = () => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      let SLOP = Math.max(100, container.clientHeight / 4)
      if (container.scrollHeight - container.scrollTop <= container.clientHeight + SLOP) {
        scrollToBottom();
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-r from-orange-100 via-red-100 to-yellow-100">
      <h1 className="p-4 text-center bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 text-xl shadow-lg">Membly</h1>
      <div ref={messagesRef} className="flex flex-col flex-grow space-y-2 p-4 w-full overflow-y-auto">
        {messages.map((m: Message, i) => {
          return (
            <div key={i} className={"flex mb-4 " + (m.direction === "out" ? "justify-end pl-32" : "justify-start pr-32")}>
              <div className={"p-3 text-left shadow-lg rounded-lg max-w-m ring-2 ring-opacity-50 ring-orange-500 " + (m.direction === "out" ? "bg-gradient-to-r from-orange-300 to-yellow-200 text-black" : "bg-gradient-to-r from-red-300 to-orange-300 text-black")}>
                <Markdown components={{a(props) {
                  const {node, ...rest} = props
                  return <a style={{color: 'blue', textDecoration: 'underline'}} {...rest}/>
                }}}>{m.text}</Markdown>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-center p-4 w-full bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 shadow-lg shadow-top z-10">
        <textarea
          autoFocus
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 overflow-y-auto"
          placeholder="Search..."
        />
        <button
          onClick={handleSearch}
          className={"px-4 py-2 text-white rounded-r-md focus:outline-none focus:ring-2 h-full " + (sendEnabled ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600" : "bg-gray-600")}
        >
          {sendEnabled ? "Search" : "Processing"}
        </button>
      </div>
    </div>
  );
};

export default Search;
import React from 'react'
import Markdown from 'markdown-to-jsx'

function SyntaxHighlightedCode(props) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [ props.className, props.children ])
  return <code {...props} ref={ref} />
}

const ChatArea = ({ messages, message, setMessage, send, messageBox, user }) => {
  const WriteAiMessage = (message) => {
    const messageObject = JSON.parse(message)
    return (
      <div className='overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-green-400 rounded-lg p-4 border border-green-500/30 shadow-lg'>
        <Markdown children={messageObject.text} options={{ overrides: { code: SyntaxHighlightedCode } }} />
      </div>
    )
  }

  return (
    <div className="conversation-area flex-grow flex flex-col h-full relative">
      <div
        ref={messageBox}
        className="message-box p-4 flex-grow flex flex-col gap-3 overflow-auto max-h-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
      >
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-60'} ${msg.sender._id === user._id && 'ml-auto'} message flex flex-col p-3 rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
            msg.sender._id === 'ai'
              ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50'
              : msg.sender._id === user._id
                ? 'bg-gradient-to-br from-blue-600 to-blue-500 border-blue-400/50'
                : 'bg-gradient-to-br from-slate-600 to-slate-500 border-slate-400/50'
          }`}>
            <small className='opacity-70 text-xs font-medium text-slate-300'>{msg.sender.email}</small>
            <div className='text-sm mt-1'>
              {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p className='text-white'>{msg.message}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="inputField w-full flex border-t border-slate-700/50 bg-slate-800/50">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='p-4 border-none outline-none flex-grow bg-transparent text-white placeholder-slate-400 focus:bg-slate-800/30 transition-all duration-200'
          type="text" 
          placeholder='Type your message...'
          onKeyPress={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className='px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white transition-all duration-200 shadow-md hover:shadow-lg border-l border-green-400/30'
        >
          <i className="ri-send-plane-fill"></i>
        </button>
      </div>
    </div>
  )
}

export default ChatArea

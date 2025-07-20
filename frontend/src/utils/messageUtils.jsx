import React, { useRef } from 'react'
import Markdown from 'markdown-to-jsx'

// Syntax highlighting component for code blocks
function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])

    return <code {...props} ref={ref} />
}

// Component to render AI messages with markdown support
export function WriteAiMessage({ message }) {
    const messageObject = JSON.parse(message)

    return (
        <div className='overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-green-400 rounded-lg p-4 border border-green-500/30 shadow-lg'>
            <Markdown
                children={messageObject.text}
                options={{
                    overrides: {
                        code: SyntaxHighlightedCode,
                    },
                }}
            />
        </div>
    )
}
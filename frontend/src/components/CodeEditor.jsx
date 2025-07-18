import React from 'react'
import hljs from 'highlight.js'

const CodeEditor = ({
  fileTree,
  currentFile,
  setCurrentFile,
  openFiles,
  setOpenFiles,
  saveFileTree,
  webContainer,
  setIframeUrl,
  runProcess,
  setRunProcess,
  iframeUrl
}) => {
  return (
    <section className="right flex-grow h-full flex bg-slate-950">
      {/* File Explorer */}
      <div className="explorer h-full max-w-64 min-w-52 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50">
        <div className="file-tree w-full">
          <div className="p-3 bg-slate-700/50 border-b border-slate-600/50">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Explorer</h3>
          </div>
          {Object.keys(fileTree).map((file, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentFile(file)
                setOpenFiles([...new Set([...openFiles, file])])
              }}
              className={`tree-element cursor-pointer p-3 px-4 flex items-center gap-2 w-full transition-all duration-200 hover:bg-slate-700/50 border-l-2 ${
                currentFile === file 
                  ? 'bg-slate-700/70 border-l-blue-500 text-blue-400' 
                  : 'border-l-transparent text-slate-300 hover:text-white'
              }`}
            >
              <i className="ri-file-code-line text-sm"></i>
              <p className='font-medium text-sm'>{file}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="code-editor flex flex-col flex-grow h-full">
        {/* Tabs and Actions */}
        <div className="top flex justify-between w-full bg-slate-800 border-b border-slate-700/50">
          <div className="files flex">
            {openFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => setCurrentFile(file)}
                className={`open-file cursor-pointer p-3 px-4 flex items-center gap-2 transition-all duration-200 border-r border-slate-700/50 hover:bg-slate-700/50 ${
                  currentFile === file 
                    ? 'bg-slate-700 text-white border-b-2 border-b-blue-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="ri-file-code-line text-sm"></i>
                <p className='font-medium text-sm'>{file}</p>
              </button>
            ))}
          </div>

          <div className="actions flex gap-2 p-2">
            <button
              onClick={async () => {
                await webContainer.mount(fileTree)
                const installProcess = await webContainer.spawn("npm", [ "install" ])
                installProcess.output.pipeTo(new WritableStream({
                  write(chunk) { console.log(chunk) }
                }))
                if (runProcess) runProcess.kill()
                let tempRun = await webContainer.spawn("npm", [ "start" ])
                tempRun.output.pipeTo(new WritableStream({
                  write(chunk) { console.log(chunk) }
                }))
                setRunProcess(tempRun)
                webContainer.on('server-ready', (port, url) => {
                  console.log(port, url)
                  setIframeUrl(url)
                })
              }}
              className='px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-green-400/30 font-medium'
            >
              <i className="ri-play-fill mr-1"></i>
              Run
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="bottom flex flex-grow max-w-full overflow-auto">
          {fileTree[currentFile] && (
            <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-900 border-r border-slate-700/50">
              <pre className="hljs h-full bg-slate-900">
                <code
                  className="hljs h-full outline-none text-slate-300 bg-slate-900"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedContent = e.target.innerText;
                    const updatedTree = {
                      ...fileTree,
                      [currentFile]: {
                        file: { contents: updatedContent }
                      }
                    }
                    saveFileTree(updatedTree)
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value 
                  }}
                  style={{
                    whiteSpace: 'pre-wrap',
                    paddingBottom: '25rem',
                    padding: '1rem',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontFamily: 'Monaco, Consolas, \"Courier New\", monospace'
                  }}
                />
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {iframeUrl && webContainer && (
        <div className="flex min-w-96 flex-col h-full border-l border-slate-700/50">
          <div className="address-bar bg-slate-800 border-b border-slate-700/50 p-2">
            <div className="flex items-center gap-2">
              <i className="ri-global-line text-slate-400"></i>
              <input 
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl} 
                className="flex-grow p-2 bg-slate-700 text-white rounded-lg border border-slate-600/50 focus:border-blue-500/50 outline-none transition-all duration-200"
                placeholder="Enter URL..."
              />
            </div>
          </div>
          <iframe 
            src={iframeUrl} 
            className="w-full h-full bg-white"
            title="Preview"
          />
        </div>
      )}
    </section>
  )
}

export default CodeEditor

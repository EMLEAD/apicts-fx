'use client';

import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Image, Undo, Redo } from 'lucide-react';

export default function CustomRichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [history, setHistory] = useState([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleChange();
  };

  const handleChange = () => {
    const content = editorRef.current?.innerHTML || '';
    onChange(content);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      editorRef.current.innerHTML = history[newIndex];
      onChange(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      editorRef.current.innerHTML = history[newIndex];
      onChange(history[newIndex]);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-1 flex items-center space-x-1 flex-wrap">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        
        <div className="w-px h-5 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Align Center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Align Right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={insertLink}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link"
        >
          <Link className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insert Image"
        >
          <Image className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={undo}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={redo}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleChange}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none bg-white"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}


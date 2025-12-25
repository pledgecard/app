import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Heading1, Heading2, Quote, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className = '' }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. from AI) to the editor
  useEffect(() => {
    if (contentRef.current && value !== contentRef.current.innerHTML && document.activeElement !== contentRef.current) {
      contentRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) onChange(contentRef.current.innerHTML);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Insert image without default margins so alignment works
        const imgHtml = `<img src="${e.target?.result}" class="max-w-full h-auto rounded-xl shadow-md my-4 border border-gray-100 inline-block" />`;
        exec('insertHTML', imgHtml);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-brand-500 transition-all shadow-sm ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <ToolbarButton icon={<Bold size={18} />} onClick={() => exec('bold')} title="Bold" />
        <ToolbarButton icon={<Italic size={18} />} onClick={() => exec('italic')} title="Italic" />
        
        <div className="w-px h-6 bg-gray-300 mx-1.5 opacity-50" />
        
        <ToolbarButton icon={<Heading1 size={18} />} onClick={() => exec('formatBlock', 'H2')} title="Heading 1" />
        <ToolbarButton icon={<Heading2 size={18} />} onClick={() => exec('formatBlock', 'H3')} title="Heading 2" />
        
        <div className="w-px h-6 bg-gray-300 mx-1.5 opacity-50" />
        
        <ToolbarButton icon={<List size={18} />} onClick={() => exec('insertUnorderedList')} title="Bullet List" />
        <ToolbarButton icon={<ListOrdered size={18} />} onClick={() => exec('insertOrderedList')} title="Numbered List" />
        <ToolbarButton icon={<Quote size={18} />} onClick={() => exec('formatBlock', 'blockquote')} title="Quote" />
        
        <div className="w-px h-6 bg-gray-300 mx-1.5 opacity-50" />

        <ToolbarButton icon={<AlignLeft size={18} />} onClick={() => exec('justifyLeft')} title="Align Left" />
        <ToolbarButton icon={<AlignCenter size={18} />} onClick={() => exec('justifyCenter')} title="Align Center" />
        <ToolbarButton icon={<AlignRight size={18} />} onClick={() => exec('justifyRight')} title="Align Right" />
        
        <div className="w-px h-6 bg-gray-300 mx-1.5 opacity-50" />

        <label className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-lg cursor-pointer transition-colors" title="Insert Image">
          <ImageIcon size={18} />
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Editor Area */}
      <div
        ref={contentRef}
        className="p-6 min-h-[400px] outline-none prose prose-lg prose-green max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder="Tell your story..."
      />
    </div>
  );
};

const ToolbarButton = ({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title?: string }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors focus:outline-none focus:bg-gray-200"
  >
    {icon}
  </button>
);
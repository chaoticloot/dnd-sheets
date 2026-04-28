import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (json: any) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        onFileUpload(json);
      } catch (err) {
        console.error('Failed to parse JSON file:', err);
        alert('Invalid JSON file. Please ensure it is a valid Foundry VTT actor export.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className="max-w-xl mx-auto mt-10 p-10 border-4 border-dashed border-gray-400 bg-white rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-800 hover:bg-gray-50 transition-colors shadow-lg"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept="application/json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
      />
      <Upload size={48} className="text-gray-400 mb-4" />
      <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Upload Foundry JSON</h3>
      <p className="text-gray-500 font-sans">
        Drag and drop your exported actor JSON file here
        <br />
        or click to browse
      </p>
    </div>
  );
}

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploaderProps {
  onFileUpload: (data: any) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.type !== 'character' || !json.system) {
          setError('Invalid Foundry VTT character JSON. Make sure it is exported from a dnd5e actor.');
          return;
        }
        setError(null);
        onFileUpload(json);
      } catch (err) {
        setError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20">
      <div
        className={`relative p-12 transition-all duration-300 border-[3px] border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
          isDragging ? 'border-dnd-red bg-red-50/50' : 'border-gray-400 hover:border-gray-500 hover:bg-gray-50 shadow-sm bg-white text-dnd-ink'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 mix-blend-overlay"></div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".json"
          className="hidden"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-red-100 p-4 rounded-full mb-4 shadow-inner"
        >
          <Upload className="w-10 h-10 text-dnd-red" />
        </motion.div>
        
        <h3 className="text-2xl font-serif font-semibold text-dnd-ink mb-2">
          Upload Character Data
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Drag and drop your exported Foundry VTT 5e actor JSON file here, or click to browse.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg"
            >
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 flex items-center space-x-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
          <FileJson size={16} />
          <span>Foundry VTT JSON Required</span>
        </div>
      </div>
    </div>
  );
}

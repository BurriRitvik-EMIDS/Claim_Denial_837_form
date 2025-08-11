import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

import { parsePDF } from '../utils/pdfParser';
import { FormData } from '../types/FormTypes';

interface FileUploadProps {
  onFileUpload: (file: File, parsedData: FormData) => Promise<void>;
  uploadedFile: File | null;
  onRemoveFile: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, uploadedFile, onRemoveFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        const parsedData = await parsePDF(file);
        await onFileUpload(file, parsedData as FormData);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        let errorMessage = 'Error parsing PDF. ';
        if (error instanceof Error) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please make sure the file is valid and try again.';
        }
        alert(errorMessage);
      }
    } else {
      alert('Please select a PDF file.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        const parsedData = await parsePDF(file);
        await onFileUpload(file, parsedData as FormData);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        let errorMessage = 'Error parsing PDF. ';
        if (error instanceof Error) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please make sure the file is valid and try again.';
        }
        alert(errorMessage);
      }
    } else {
      alert('Please select a PDF file.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        Upload EDI 837 Document
      </h2>

      {!uploadedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-blue-400 cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Upload PDF</p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your Claim file here, or click to browse
          </p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
              <p className="text-sm text-green-600">File uploaded successfully</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
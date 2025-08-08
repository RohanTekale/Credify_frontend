import React, { useState } from 'react';
import api from '../../services/api';

export default function KYCUpload() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const formData = new FormData();
    formData.append('document', file);
    await api.post('/auth/kyc/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('KYC Uploaded');
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded w-80 space-y-4">
        <h2 className="text-xl font-bold">Upload KYC</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={upload} className="w-full bg-yellow-600 py-2 rounded">Upload</button>
      </div>
    </div>
  );
}

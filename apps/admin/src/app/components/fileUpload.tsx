import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);

    if (selectedFile?.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/file`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status !== 201 && response.status !== 200) {
        throw new Error('Ошибка загрузки файла');
      }

      alert('Файл успешно загружен'); // Можно заменить на notify, если используешь react-admin
      setFile(null);
      setPreview(null);

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      alert('Не удалось загрузить файл'); // Можно заменить на notify
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mb={2}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
      >
        Выбрать файл
        <input type="file" hidden onChange={handleFileChange} />
      </Button>

      {file && (
        <Box>
          <Typography variant="body2">{file.name}</Typography>
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ maxWidth: 200, marginTop: 8 }}
            />
          )}
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        disabled={!file || loading}
        onClick={handleUpload}
        startIcon={loading ? <CircularProgress size={20} /> : undefined}
      >
        {loading ? 'Загрузка...' : 'Загрузить'}
      </Button>
    </Box>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import {
  TextInput,
  useRecordContext,
  useNotify,
  useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@mui/material';
import { FileList, isImageFile } from '../resources';

interface FileSelectorProps {
  source: string;
  label?: string;
}


export const FileSelector: React.FC<FileSelectorProps> = ({
  source,
  label,
}) => {
  const recordContext = useRecordContext<Record<string, any>>();
  const record = useMemo(() => recordContext || {}, [recordContext]);
  const { setValue } = useFormContext();
  const [open, setOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(record[source] || '');
  const notify = useNotify();
  const refresh = useRefresh();

  useEffect(() => {
    if (record[source]) {
      setSelectedUrl(record[source]);
    }
  }, [record, source]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    setValue(source, url, { shouldDirty: true, shouldTouch: true });
    notify('Файл выбран', { type: 'info' });
    handleClose();
    refresh();
  };

  return (
    <Box display="flex" flexDirection="column" gap={1} mb={2} width="100%">
      {label && <Typography variant="subtitle2">{label}</Typography>}

      {selectedUrl && (
        isImageFile(selectedUrl) ? (
          <img
            src={selectedUrl}
            alt="selected"
            style={{ maxWidth: 200, border: '1px solid #ccc', padding: 2 }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              border: '1px solid #ccc',
              padding: 1,
              maxWidth: 200,
              wordBreak: 'break-all',
            }}
          >
            {selectedUrl.split('/').pop()}
          </Typography>
        )
      )}

      <TextInput source={source} label={label} fullWidth />

      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ width: 'auto', maxWidth: 200 }}
      >
        Выбрать файл
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Выберите файл</DialogTitle>
        <DialogContent>
          <FileList resource="file" onSelect={handleSelect} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

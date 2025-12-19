/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Button,
  RaRecord,
  useDelete,
  useNotify,
  useRedirect,
} from 'react-admin';
import DeleteIcon from '@mui/icons-material/Delete';

interface CustomDeleteButtonProps {
  parentResource: string;
  resource: string;
  record?: any;
  label?: string;
  confirm?: (record: RaRecord) => string;
}

export const CustomDeleteButton: React.FC<CustomDeleteButtonProps> = ({
  parentResource,
  resource,
  record,
  label = 'Удалить',
  confirm,
}) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [deleteOne, { isLoading }] = useDelete(resource, record?.id);

  const handleClick = () => {
    if (!record?.id) return;

    // подтверждение удаления
    if (confirm) {
      const confirmed = window.confirm(confirm(record));
      if (!confirmed) return;
    }

    deleteOne(
      resource,
      { id: record.id },
      {
        onSuccess: () => {
          notify(`${resource} удалён`, { type: 'info' });
          if (record.parentId) {
            redirect(`/${parentResource}/${record.parentId}/show`);
          } else {
            redirect(`/${resource}`);
          }
        },
        onError: (error: any) => {
          notify(`Ошибка при удалении: ${error.message}`, { type: 'warning' });
        },
      }
    );
  };

  return (
    <Button
      label={label}
      onClick={handleClick}
      disabled={isLoading}
      startIcon={<DeleteIcon />}
      color="error" // делает кнопку красной
    />
  );
};

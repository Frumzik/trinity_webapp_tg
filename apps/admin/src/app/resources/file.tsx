import React from 'react';
import {
  List,
  useListContext,
  ListProps,
  TextInput,
  Filter,
} from 'react-admin';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { FileUpload } from '../components';

// Тип файла
interface ImageItem {
  id: number;
  Key: string;
  LastModified: string;
  Size: number;
  ETag: string;
  StorageClass: string;
  url: string;
}

// Проверка на изображение
export const isImageFile = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

// Фильтр
const FileFilter: React.FC = (props) => (
  <Filter {...props}>
    <TextInput label="Название файла" source="Key" alwaysOn />
  </Filter>
);

interface ImageGridProps {
  onSelect?: (url: string) => void;
}

// Сетка карточек
const ImageGrid: React.FC<ImageGridProps> = ({ onSelect }) => {
  const { data, isLoading } = useListContext<ImageItem>();

  if (isLoading || !data) return <p>Загрузка...</p>;

  return (
    <Grid container spacing={2}>
      {data.map((item) => (
        <Grid key={item.id}>
          <Card
            onClick={() => (onSelect ? onSelect(item.url) : null)} // вызываем callback
            sx={{ cursor: 'pointer', height: '100%' }}
          >
            {isImageFile(item.url || '') ? (
              <CardMedia
                component="img"
                height="140"
                image={item.url}
                alt={item.Key || 'file'}
              />
            ) : (
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 140,
                  backgroundColor: '#f0f0f0',
                }}
              >
                <InsertDriveFileIcon sx={{ fontSize: 48, color: '#999' }} />
              </CardContent>
            )}

            <CardContent>
              <Typography variant="subtitle1" noWrap>
                {item.Key ? item.Key.split('/').pop() : 'Без имени'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(item.LastModified), 'yyyy-MM-dd HH:mm')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(item.Size / 1024).toFixed(1)} KB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

interface FileListPageProps extends ListProps {
  onSelect?: (url: string) => void;
}

// Главный список с фильтром и сортировкой
export const FileList: React.FC<FileListPageProps> = (props) => (
  <Box mt={2}>
    {' '}
    {/* отступ сверху */}
    <FileUpload />
    <List
      {...props}
      perPage={20}
      filters={<FileFilter />}
      sort={{ field: 'LastModified', order: 'DESC' }} // по умолчанию сортировка по дате
    >
      <ImageGrid onSelect={props.onSelect} />
    </List>
  </Box>
);

export const FileListWithCopy: React.FC<FileListPageProps> = (props) => {
  return (
    <FileList
      {...props} // обязательные props от React Admin
      onSelect={(url: string) =>
        navigator.clipboard.writeText(url).then(() => {
          alert('Ссылка скопирована!');
        })
      }
    />
  );
};

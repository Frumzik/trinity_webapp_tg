/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  Create,
  SelectField,
  SelectInput,
  ImageField,
  FormDataConsumer,
  FunctionField,
  ReferenceInput,
  required,
  useRecordContext,
  TopToolbar,
  Button,
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { FileSelector } from '../components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FavoritesTag, FavoritesTagTitles } from './training';
import { useFormContext, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { CustomDeleteButton } from '../components/buttons';
import EditIcon from '@mui/icons-material/Edit';

enum LessonType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  FILM = 'film',
  PRACTISE = 'practise',
}

// Словарь для отображения типов уроков
const LessonTypeTitles: Record<LessonType, string> = {
  video: 'Видео',
  audio: 'Аудио',
  text: 'Текст',
  film: 'Фильм',
  practise: 'Практика',
};

export const LessonDatagrid = () => (
  <Datagrid rowClick="show" bulkActionButtons={false}>
    <NumberField source="lessonId" label="ID" />
    <ImageField source="coverUrl" label="Обложка" />
    <TextField source="title" label="Название" />
    <SelectField
      source="type"
      label="Тип"
      choices={Object.values(LessonType).map((type) => ({
        id: type,
        name: LessonTypeTitles[type],
      }))}
    />
    <NumberField source="price" label="Цена" />
    <NumberField source="salePrice" label="Скидка" />
    <TextField source="duration" label="Длительность" />
  </Datagrid>
);
// 🔹 List
export const LessonList = () => (
  <List actions={false}>
    <LessonDatagrid />
  </List>
);

const LessonShowActions = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  const handleEditLesson = () => {
    navigate(`/lesson/${record.lessonId}`);
  };

  return (
    <TopToolbar>
      <Button
        label="Редактировать"
        onClick={handleEditLesson}
        startIcon={<EditIcon />}
      />
      <CustomDeleteButton
        parentResource="training"
        resource="lesson"
        record={record}
        confirm={() => 'Вы уверены что хотите удалить урок?\nЭто действие нельзя отменить'}
      />
    </TopToolbar>
  );
};

// 🔹 Show урока
export const LessonShow = () => (
  <Show actions={<LessonShowActions />}>
    <SimpleShowLayout>
      <NumberField source="lessonId" label="ID" />

      <SelectField
        source="type"
        label="Тип урока"
        choices={Object.values(LessonType).map((type) => ({
          id: type,
          name: LessonTypeTitles[type],
        }))}
      />
      <SelectField
        source="favoritesTag"
        label="Тэг избранного"
        choices={Object.entries(FavoritesTag).map(([key, value]) => ({
          id: value,
          name: FavoritesTagTitles[value],
        }))}
      />

      {/* Родительский тренинг */}
      <FunctionField
        label="Родительский тренинг"
        render={(record: any) =>
          record?.parent ? (
            <Link to={`/training/${record.parent.trainingId}/show`}>
              {record.parent.trainingId} — {record.parent.title}
            </Link>
          ) : (
            '—'
          )
        }
      />

      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <TextField source="shortDescription" label="Краткое описание" />

      <TextField source="duration" label="Длительность" />
      <NumberField source="price" label="Цена" />
      <NumberField source="salePrice" label="Скидка" />

      {/* Картинки */}
      <ImageField source="coverUrl" label="Обложка" />
      {/* <ImageField source="iconUrl" label="Иконка" /> */}
      <ImageField source="bgUrl" label="Фон" />

      {/* --- Условный контент УСТОЙЧИВО ЧЕРЕЗ FunctionField --- */}
      <FunctionField
        label="Контент"
        render={(record: any) => {
          if (!record) return null;

          switch (record.type) {
            case LessonType.TEXT:
            case LessonType.FILM:
            case LessonType.PRACTISE:
              return (
                <div
                  style={{
                    padding: '10px 0',
                    borderTop: '1px solid #eee',
                    marginTop: 8,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: record.content?.html || '',
                  }}
                />
              );

            case LessonType.VIDEO:
              return <span>{record.content?.videoUrl || '—'}</span>;

            case LessonType.AUDIO:
              return <span>{record.content?.audioUrl || '—'}</span>;

            default:
              return '—';
          }
        }}
      />
    </SimpleShowLayout>
  </Show>
);

// 🔹 Edit урока
export const LessonEdit = () => (
  <Edit
    redirect={(basePath, id) => (id ? `/lesson/${id}/show` : `/lesson`)}
    mutationMode="pessimistic"
  >
    <SimpleForm>
      <NumberInput source="lessonId" disabled label="ID" />
      <TextInput source="title" label="Название" />
      <TextInput source="description" label="Описание" multiline />
      <TextInput source="shortDescription" label="Краткое описание" multiline />

      {/* Родительский тренинг */}
      <ReferenceInput
        source="parentId"
        reference="training"
        label="Родительский тренинг"
        sort={{ field: 'trainingId', order: 'ASC' }}
      >
        <SelectInput
          optionText={(record) => `${record.trainingId} — ${record.title}`}
          disabled
        />
      </ReferenceInput>

      <SelectInput
        source="type"
        label="Тип урока"
        choices={Object.values(LessonType).map((t) => ({
          id: t,
          name: LessonTypeTitles[t],
        }))}
        disabled
      />
      <SelectInput
        source="favoritesTag"
        label="Тэг избранного"
        choices={Object.entries(FavoritesTag).map(([key, value]) => ({
          id: value,
          name: FavoritesTagTitles[value],
        }))}
      />

      <TextInput source="duration" label="Длительность" />
      <NumberInput source="price" label="Цена" />
      <NumberInput source="salePrice" label="Скидка" />

      {/* Картинки */}
      <FileSelector source="coverUrl" label="Обложка" />
      {/* <FileSelector source="iconUrl" label="Иконка" /> */}
      <FileSelector source="bgUrl" label="Фон" />

      {/* Динамическое поле контента */}
      <FormDataConsumer>
        {({ formData, ...rest }) => {
          switch (formData.type) {
            case LessonType.VIDEO:
              return (
                <FileSelector
                  source="content.videoUrl"
                  label="Видео URL"
                  {...rest}
                />
              );
            case LessonType.AUDIO:
              return (
                <FileSelector
                  source="content.audioUrl"
                  label="Аудио URL"
                  {...rest}
                />
              );
            case LessonType.TEXT:
            case LessonType.FILM:
            case LessonType.PRACTISE:
              return (
                <RichTextInput
                  source="content.html"
                  label="HTML контент"
                  {...rest}
                />
              );
            default:
              return null;
          }
        }}
      </FormDataConsumer>
    </SimpleForm>
  </Edit>
);

const LessonCreateFormContent = () => {
  const { setValue } = useFormContext();
  const type = useWatch({ name: 'type' }); // следим за типом урока

  // очистка полей при смене типа
  useEffect(() => {
    switch (type) {
      case LessonType.VIDEO:
        setValue('content.audioUrl', undefined);
        setValue('content.html', undefined);
        break;
      case LessonType.AUDIO:
        setValue('content.videoUrl', undefined);
        setValue('content.html', undefined);
        break;
      case LessonType.TEXT:
      case LessonType.FILM:
      case LessonType.PRACTISE:
        setValue('content.videoUrl', undefined);
        setValue('content.audioUrl', undefined);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <FormDataConsumer>
      {({ formData, ...rest }) => {
        switch (formData.type) {
          case LessonType.VIDEO:
            return (
              <FileSelector
                source="content.videoUrl"
                label="Видео URL"
                {...rest}
              />
            );
          case LessonType.AUDIO:
            return (
              <FileSelector
                source="content.audioUrl"
                label="Аудио URL"
                {...rest}
              />
            );
          case LessonType.TEXT:
          case LessonType.FILM:
          case LessonType.PRACTISE:
            return (
              <RichTextInput
                source="content.html"
                label="HTML контент"
                {...rest}
              />
            );
          default:
            return null;
        }
      }}
    </FormDataConsumer>
  );
};

export const LessonCreate = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const parentIdFromUrl = searchParams.get('parentId');
  const defaultParentId = parentIdFromUrl ? Number(parentIdFromUrl) : undefined;

  return (
    <Create
      title="Создать урок"
      redirect={(basePath, id) => (id ? `/lesson/${id}/show` : 'lesson')}
    >
      <SimpleForm
        defaultValues={{
          parentId: defaultParentId,
          type: LessonType.TEXT,
          favoritesTag: FavoritesTag.STANDART,
        }}
      >
        {/* Основные поля */}
        <TextInput
          source="title"
          label="Название"
          fullWidth
          validate={required()}
        />
        <TextInput source="description" label="Описание" multiline fullWidth />
        <TextInput
          source="shortDescription"
          label="Краткое описание"
          multiline
          fullWidth
        />

        <SelectInput
          source="type"
          label="Тип урока"
          choices={Object.values(LessonType).map((t) => ({
            id: t,
            name: LessonTypeTitles[t],
          }))}
          validate={required()}
        />

        {/* Динамический контент с очисткой при смене типа */}
        <LessonCreateFormContent />

        {/* Родительский тренинг */}
        <ReferenceInput
          source="parentId"
          reference="training"
          label="Родительский тренинг"
          sort={{ field: 'trainingId', order: 'ASC' }}
        >
          <SelectInput
            optionText={(record) => `${record.trainingId} — ${record.title}`}
            validate={required()}
          />
        </ReferenceInput>

        {/* Тэг избранного */}
        <SelectInput
          source="favoritesTag"
          label="Тэг избранного"
          choices={Object.values(FavoritesTag).map((t) => ({
            id: t,
            name: FavoritesTagTitles[t],
          }))}
          validate={required()}
        />

        <TextInput source="duration" label="Длительность" />
        <NumberInput source="price" label="Цена" />
        <NumberInput source="salePrice" label="Скидка" />

        {/* Картинки */}
        <FileSelector source="coverUrl" label="Обложка" />
        {/* <FileSelector source="iconUrl" label="Иконка" /> */}
        <FileSelector source="bgUrl" label="Фон" />
      </SimpleForm>
    </Create>
  );
};

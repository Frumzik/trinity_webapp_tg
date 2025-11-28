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
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { FileSelector } from '../components';

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
  <Datagrid rowClick="show">
    <NumberField source="lessonId" label="ID" />
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
  <List>
    <LessonDatagrid />
  </List>
);
// 🔹 Show урока
export const LessonShow = () => (
  <Show>
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

      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <TextField source="shortDescription" label="Краткое описание" />

      <TextField source="duration" label="Длительность" />
      <NumberField source="price" label="Цена" />
      <NumberField source="salePrice" label="Скидка" />

      {/* Картинки */}
      <ImageField source="coverUrl" label="Обложка" />
      <ImageField source="iconUrl" label="Иконка" />
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
                  dangerouslySetInnerHTML={{ __html: record.content?.html || '' }}
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
      <SelectInput
        source="type"
        label="Тип урока"
        choices={Object.values(LessonType).map((t) => ({
          id: t,
          name: LessonTypeTitles[t],
        }))}
        disabled
      />
      <TextInput source="duration" label="Длительность" />
      <NumberInput source="price" label="Цена" />
      <NumberInput source="salePrice" label="Скидка" />

      {/* Картинки */}
      <FileSelector source="coverUrl" label="Обложка" />
      <FileSelector source="iconUrl" label="Иконка" />
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

// 🔹 Create
export const LessonCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput
        source="description"
        label="Описание"
        fullWidth
        multiline
        minRows={4}
      />
      <TextInput source="shortDescription" label="Краткое описание" fullWidth />
      <TextInput source="duration" label="Длительность" />
      <SelectInput
        source="type"
        label="Тип"
        choices={Object.keys(LessonTypeTitles).map((key) => ({
          id: key,
          name: LessonTypeTitles[key as LessonType],
        }))}
      />
      <NumberInput source="parentId" label="Parent Training ID" />
    </SimpleForm>
  </Create>
);

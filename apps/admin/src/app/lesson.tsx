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
  EditButton,
  ShowButton,
  SelectField,
  SelectInput,
} from 'react-admin';

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

// 🔹 List
export const LessonList = () => (
  <List>
    <Datagrid rowClick="show">
      <NumberField source="lessonId" label="ID" />
      <TextField source="title" label="Название" />
      <SelectField
        source="type"
        label="Тип"
        choices={Object.keys(LessonTypeTitles).map((key) => ({
          id: key,
          name: LessonTypeTitles[key as LessonType],
        }))}
      />
      <NumberField source="parentId" label="Parent Training ID" />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

// 🔹 Show
export const LessonShow = () => (
  <Show>
    <SimpleShowLayout>
      <NumberField source="lessonId" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <TextField source="shortDescription" label="Краткое описание" />
      <TextField source="duration" label="Длительность" />
      <SelectField
        source="type"
        label="Тип"
        choices={Object.keys(LessonTypeTitles).map((key) => ({
          id: key,
          name: LessonTypeTitles[key as LessonType],
        }))}
      />
      <NumberField source="parentId" label="Parent Training ID" />
    </SimpleShowLayout>
  </Show>
);

// 🔹 Edit
export const LessonEdit = () => (
  <Edit
    redirect={(basePath, id, data) =>
      (data as any).parentId
        ? `/training/${(data as any).parentId}/show`
        : `lesson`
    }
  >
    <SimpleForm>
      <NumberInput disabled source="lessonId" label="ID" />
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

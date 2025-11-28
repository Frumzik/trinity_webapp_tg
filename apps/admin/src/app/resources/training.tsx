/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// trainings.resource.tsx
import {
  List,
  Datagrid,
  TextField,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  Create,
  TextInput,
  SingleFieldList,
  ChipField,
  ReferenceManyField,
  SelectField,
  NumberField,
  ImageField,
  SelectInput,
  NumberInput,
} from 'react-admin';
import { LessonDatagrid } from './lesson';
import { FileSelector } from '../components';

enum TrainingType {
  TRAINING = 'training',
  PRACTISE = 'practise',
}

const TrainingTypeTitles = {
  [TrainingType.TRAINING]: 'Тренинг',
  [TrainingType.PRACTISE]: 'Практика',
};

enum TrainingTag {
  STANDART = 'standart',
  STAGES_SPIRIT = 'stages_spirit',
  STAGE_LEVEL = 'stage_level',
  STAGE = 'stage',
  USEFUL_MATERIALS = 'userful_materials',
  GIFTS = 'gifts',
  KNOWLEDGE_WORKSHOP = 'knowledge_workshop',
  HEALTH_LAB = 'health_lab',
  PRACTISE = 'practise',
  COURSE = 'course',
}

const TrainingTagTitles = {
  [TrainingTag.STANDART]: 'Стандарт',
  [TrainingTag.STAGES_SPIRIT]: 'Ступени Духа',
  [TrainingTag.STAGE_LEVEL]: 'Уровень ступеней',
  [TrainingTag.STAGE]: 'Ступень',
  [TrainingTag.USEFUL_MATERIALS]: 'Полезные материалы',
  [TrainingTag.GIFTS]: 'Дары',
  [TrainingTag.KNOWLEDGE_WORKSHOP]: 'Мастерская знаний',
  [TrainingTag.HEALTH_LAB]: 'Лаборатория Здоровья',
  [TrainingTag.PRACTISE]: 'Практика',
  [TrainingTag.COURSE]: 'Курс',
};

enum FavoritesTag {
  STANDART = 'standart',
  FILM = 'film',
  MUSIC = 'music',
  MEDITATION = 'meditation',
  BOOK = 'book',
  PRODUCT = 'product',
}

const FavoritesTagTitles = {
  [FavoritesTag.STANDART]: 'Избранное',
  [FavoritesTag.FILM]: 'Фильмы',
  [FavoritesTag.MUSIC]: 'Музыка',
  [FavoritesTag.MEDITATION]: 'Медитации',
  [FavoritesTag.BOOK]: 'Книгиы',
  [FavoritesTag.PRODUCT]: 'Продукты',
};

const TrainingDatagrid = () => (
  <Datagrid rowClick="show">
    <TextField source="id" />
    <TextField source="title" label="Название" />
    <TextField source="description" label="Описание" />
    <TextField source="shortDescrtiption" label="Краткое описание" />

    {/* ЦЕНЫ */}
    <NumberField source="price" label="Цена" />
    <NumberField source="salePrice" label="Цена со скидкой" />

    {/* Подтренинги */}
    <ReferenceManyField
      label="Подтренинги"
      reference="training"
      target="parentId"
    >
      <SingleFieldList>
        <ChipField source="title" />
      </SingleFieldList>
    </ReferenceManyField>

    {/* Уроки */}
    <ReferenceManyField label="Уроки" reference="lesson" target="parentId">
      <SingleFieldList>
        <ChipField source="title" />
      </SingleFieldList>
    </ReferenceManyField>
  </Datagrid>
);

export const TrainingList = () => (
  <List>
    <TrainingDatagrid />
  </List>
);

export const TrainingShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      {/* Метаинформация */}
      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <TextField source="shortDescription" label="Короткое описание" />
      <TextField source="duration" label="Длительность" />
      <TextField source="link" label="Ссылка" />

      {/* Изображения */}
      <ImageField source="coverUrl" label="Обложка" />
      <ImageField source="iconUrl" label="Иконка" />
      <ImageField source="bgUrl" label="Фон" />

      {/* Наставник */}

      <TextField source="merchantId" label="ID наставника" />

      {/* ЦЕНЫ */}
      <NumberField source="price" label="Цена" />
      <NumberField source="salePrice" label="Цена со скидкой" />

      {/* Вывод ступени */}
      <NumberField source="stageLevel" label="Уровень ступени" />
      <NumberField source="stage" label="Ступень" />

      {/* Тип, тэг, тэг избранного */}
      <SelectField
        source="type"
        label="Тип"
        choices={Object.entries(TrainingType).map(([key, value]) => ({
          id: value,
          name: TrainingTypeTitles[value],
        }))}
      />
      <SelectField
        source="tag"
        label="Тэг"
        choices={Object.entries(TrainingTag).map(([key, value]) => ({
          id: value,
          name: TrainingTagTitles[value],
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

      {/* Доступ */}
      {/* <ArrayInput source="accessRules" label="Условия доступа">
        <SimpleFormIterator>
          <TextField source="type" label="Тип доступа" />
          <TextField source="description" label="Описание (для ошибки)" />
          <TextField source="value" label="Значение" />
        </SimpleFormIterator>
      </ArrayInput> */}

      {/* Подтренинги */}
      <ReferenceManyField
        label="Подтренинги"
        reference="training"
        target="parentId"
      >
        <TrainingDatagrid />
      </ReferenceManyField>

      {/* Уроки */}
      <ReferenceManyField label="Уроки" reference="lesson" target="parentId">
        <LessonDatagrid />
      </ReferenceManyField>
    </SimpleShowLayout>
  </Show>
);

export const TrainingEdit = () => (
  <Edit
    redirect={(basePath, id) => (id ? `/training/${id}/show` : 'training')}
    mutationMode="pessimistic"
  >
    <SimpleForm>
      {/* ID */}
      <TextInput disabled source="id" />

      {/* Мета */}
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="description" label="Описание" fullWidth multiline />
      <TextInput
        source="shortDescription"
        label="Короткое описание"
        fullWidth
      />
      <TextInput source="duration" label="Длительность" />
      <TextInput source="link" label="Ссылка" fullWidth multiline />

      {/* Картинки */}
      <FileSelector source="coverUrl" label="Обложка" />
      <FileSelector source="iconUrl" label="Иконка" />
      <FileSelector source="bgUrl" label="Фон" />

      {/* Наставник */}
      <NumberInput source="merchantId" label="ID наставника" />

      {/* Цены */}
      <NumberInput source="price" label="Цена" />
      <NumberInput source="salePrice" label="Цена со скидкой" />

      {/* Ступени */}
      <NumberInput source="stage" label="Ступень" />
      <NumberInput source="stageLevel" label="Уровень ступени" />

      {/* SELECT поля */}
      <SelectInput
        source="type"
        label="Тип"
        choices={Object.entries(TrainingType).map(([key, value]) => ({
          id: value,
          name: TrainingTypeTitles[value],
        }))}
      />

      <SelectInput
        source="tag"
        label="Тэг"
        choices={Object.entries(TrainingTag).map(([key, value]) => ({
          id: value,
          name: TrainingTagTitles[value],
        }))}
      />

      <SelectInput
        source="favoritesTag"
        label="Тэг избранного"
        choices={Object.entries(FavoritesTag).map(([key, value]) => ({
          id: value,
          name: FavoritesTagTitles[value],
        }))}
      />
    </SimpleForm>
  </Edit>
);

export const TrainingCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="slug" label="URL" fullWidth />
      <TextInput
        source="description"
        label="Описание"
        fullWidth
        multiline
        minRows={4}
      />
    </SimpleForm>
  </Create>
);

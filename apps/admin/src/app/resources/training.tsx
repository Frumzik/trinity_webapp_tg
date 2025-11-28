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
  ReferenceInput,
  FormDataConsumer,
  AutocompleteInput,
  TopToolbar,
  Button,
  useRecordContext,
  required,
  FunctionField,
} from 'react-admin';
import { LessonDatagrid } from './lesson';
import { FileSelector } from '../components';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UniversalDeleteButton } from '../components/buttons';

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

export enum FavoritesTag {
  STANDART = 'standart',
  FILM = 'film',
  MUSIC = 'music',
  MEDITATION = 'meditation',
  BOOK = 'book',
  PRODUCT = 'product',
}

export const FavoritesTagTitles = {
  [FavoritesTag.STANDART]: 'Избранное',
  [FavoritesTag.FILM]: 'Фильмы',
  [FavoritesTag.MUSIC]: 'Музыка',
  [FavoritesTag.MEDITATION]: 'Медитации',
  [FavoritesTag.BOOK]: 'Книгиы',
  [FavoritesTag.PRODUCT]: 'Продукты',
};

const TrainingDatagrid = () => (
  <Datagrid rowClick="show">
    <TextField source="trainingId" label="ID" />
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
  <List actions={false}>
    <TrainingDatagrid />
  </List>
);

const TrainingShowActions = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  const handleAddTraining = () => {
    navigate(`/training/create?parentId=${record.trainingId}`);
  };

  const handleAddLesson = () => {
    navigate(`/lesson/create?parentId=${record.trainingId}`);
  };

  const handleEditTraining = () => {
    navigate(`/training/${record.trainingId}`);
  };

  return (
    <TopToolbar>
      {record.tag !== TrainingType.PRACTISE && (
        <>
          <Button
            label="Добавить тренинг"
            onClick={handleAddTraining}
            startIcon={<AddIcon />}
          />
          <Button
            label="Добавить урок"
            onClick={handleAddLesson}
            startIcon={<AddIcon />}
          />
        </>
      )}
      <Button
        label="Редактировать"
        onClick={handleEditTraining}
        startIcon={<EditIcon />}
      />

      {record.parentId && !record.stageLevel && (
        <UniversalDeleteButton
          parentResource="training"
          resource="training"
          record={record}
        />
      )}
    </TopToolbar>
  );
};

export const TrainingShow = () => (
  <Show actions={<TrainingShowActions />}>
    <SimpleShowLayout>
      <TextField source="trainingId" label="ID тренинга" />
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

      {/* Цены */}
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
      <TextInput disabled source="trainingId" label="ID" />

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

const StageFields = () => {
  const { watch, setValue } = useFormContext<any>();
  const tag = watch('tag');

  // Сбрасываем значения при смене tag
  useEffect(() => {
    if (tag !== TrainingTag.STAGE) {
      setValue('stage', undefined);
    }
    if (tag !== TrainingTag.STAGE && tag !== TrainingTag.STAGE_LEVEL) {
      setValue('stageLevel', undefined);
    }
  }, [tag, setValue]);

  return (
    <FormDataConsumer>
      {() => (
        <>
          {(tag === TrainingTag.STAGE || tag === TrainingTag.STAGE_LEVEL) && (
            <NumberInput source="stageLevel" label="Уровень ступени" />
          )}
          {tag === TrainingTag.STAGE && (
            <NumberInput source="stage" label="Ступень" />
          )}
        </>
      )}
    </FormDataConsumer>
  );
};

export const TrainingCreate = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const parentIdParam = searchParams.get('parentId');

  return (
    <Create title="Создать тренинг">
      <SimpleForm
        defaultValues={{
          parentId: parentIdParam ? Number(parentIdParam) : null,
          type: TrainingType.TRAINING,
          tag: TrainingTag.STANDART,
          favoritesTag: FavoritesTag.STANDART,
        }}
      >
        {/* Основные поля */}
        <TextInput source="title" label="Название" validate={required()} />
        <TextInput source="description" label="Описание" multiline />
        <TextInput
          source="shortDescription"
          label="Краткое описание"
          multiline
        />

        {/* Типы и тэги */}
        <SelectInput
          source="type"
          label="Тип тренинга"
          choices={Object.values(TrainingType).map((t) => ({
            id: t,
            name: t,
          }))}
          validate={required()}
        />
        <SelectInput
          source="tag"
          label="Тэг тренинга"
          choices={Object.values(TrainingTag).map((t) => ({
            id: t,
            name: t,
          }))}
          validate={required()}
        />
        {/* Динамические поля ступени */}
        <StageFields />

        <SelectInput
          source="favoritesTag"
          label="Тэг избранного"
          choices={Object.values(FavoritesTag).map((t) => ({
            id: t,
            name: t,
          }))}
          validate={required()}
        />

        {/* Наставник */}
        <ReferenceInput
          source="merchantId"
          reference="user"
          allowEmpty
          sort={{ field: 'userId', order: 'ASC' }}
        >
          <AutocompleteInput
            optionText={(record: any) =>
              record
                ? `${record.userId} — ${record.name} (${record.username})`
                : ''
            }
            optionValue="userId"
            filterToQuery={(searchText: string) => ({ name: searchText })}
            label="Наставник"
          />
        </ReferenceInput>

        <TextInput source="duration" label="Длительность" />
        <TextInput source="link" label="Ссылка" />

        <ReferenceInput
          source="parentId"
          reference="training"
          label="Родительский тренинг"
          sort={{ field: 'trainingId', order: 'ASC' }}
          allowEmpty
        >
          <AutocompleteInput
            optionText={(record) => `${record.trainingId} — ${record.title}`}
            optionValue="trainingId"
            filterToQuery={(searchText) => ({ title: searchText })}
            label="Родительский тренинг"
            disabled={Boolean(parentIdParam)}
          />
        </ReferenceInput>

        {/* Файлы */}
        <FileSelector source="coverUrl" label="Обложка" />
        <FileSelector source="iconUrl" label="Иконка" />
        <FileSelector source="bgUrl" label="Фон" />

        {/* Цены */}
        <NumberInput source="price" label="Цена" />
        <NumberInput source="salePrice" label="Скидка" />
      </SimpleForm>
    </Create>
  );
};

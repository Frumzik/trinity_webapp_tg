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
  EditButton,
  ShowButton,
  SingleFieldList,
  ChipField,
  ReferenceManyField,
} from 'react-admin';

export const TrainingList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="title" label="Название" />

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

      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

export const TrainingShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" label="Название" />
      <TextField source="slug" label="URL" />
      <TextField source="description" label="Описание" />

      <ReferenceManyField
        label="Подтренинги"
        reference="training"
        target="parentId"
      >
        <Datagrid bulkActionButtons={false}>
          <TextField source="id" />
          <TextField source="title" />
          <ShowButton />
          <EditButton />
        </Datagrid>
      </ReferenceManyField>

      <ReferenceManyField label="Уроки" reference="lesson" target="parentId">
        <Datagrid bulkActionButtons={false}>
          <TextField source="id" />
          <TextField source="title" />
          <ShowButton />
          <EditButton />
        </Datagrid>
      </ReferenceManyField>
    </SimpleShowLayout>
  </Show>
);

export const TrainingEdit = () => (
  <Edit redirect={(basePath, id, data) =>
      (data as any).parentId
        ? `/training/${(data as any).parentId}/show`
        : `training`
    }>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="title" label="Название" fullWidth />
      <TextInput
        source="description"
        label="Описание"
        fullWidth
        multiline
        minRows={4}
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

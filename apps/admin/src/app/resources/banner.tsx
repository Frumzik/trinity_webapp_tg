import {
  Button,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  ImageField,
  List,
  NumberField,
  NumberInput,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  TopToolbar,
  useRecordContext,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { CustomDeleteButton } from '../components/buttons';
import { FileSelector } from '../components';

const BannerListActions = () => {
  const navigate = useNavigate();

  const handleAddBanner = () => {
    navigate(`/banner/create`);
  };

  return (
    <TopToolbar>
      <Button
        label="Добавить баннер"
        onClick={handleAddBanner}
        startIcon={<AddIcon />}
      />
    </TopToolbar>
  );
};

export const BannerList = () => (
  <List
    actions={<BannerListActions />}
    sort={{ field: 'bannerId', order: 'ASC' }}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <NumberField source="bannerId" label="ID" />
      <ImageField source="miniatureUrl" label="Миниатюра" />

      <TextField source="description" label="Описание" />
      <TextField source="linkUrl" label="Ссылка" />

      <DateField source="endDate" label="Дата окончания" />
    </Datagrid>
  </List>
);

const BannerShowActions = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  const handleEditBanner = () => {
    navigate(`/banner/${record.bannerId}`);
  };

  return (
    <TopToolbar>
      <Button
        label="Редактировать баннер"
        onClick={handleEditBanner}
        startIcon={<EditIcon />}
      />
      <CustomDeleteButton
        parentResource="banner"
        resource="banner"
        record={record}
      />
    </TopToolbar>
  );
};

export const BannerShow = () => (
  <Show actions={<BannerShowActions />}>
    <SimpleShowLayout>
      <NumberField source="bannerId" label="ID" />
      <ImageField source="miniatureUrl" label="Миниатюра" />

      <TextField source="description" label="Описание" />
      <TextField source="linkUrl" label="Ссылка" />

      <DateField source="endDate" label="Дата окончания" />
    </SimpleShowLayout>
  </Show>
);

export const BannerCreate = () => (
  <Create redirect={(basePath, id) => (id ? `/banner/${id}/show` : 'banner')}>
    <SimpleForm>
      <TextInput source="description" label="Описание" fullWidth />

      <TextInput source="linkUrl" label="Ссылка" fullWidth />
      <FileSelector
        source="miniatureUrl"
        label="Миниатюра (URL)"
        validate={required()}
      />
      <DateInput source="endDate" label="Дата окончания" />
    </SimpleForm>
  </Create>
);

export const BannerEdit = () => (
  <Edit
    redirect={(basePath, id) => (id ? `/banner/${id}/show` : 'banner')}
    mutationMode="pessimistic"
  >
    <SimpleForm>
      <NumberInput disabled source="bannerId" label="ID" />
      <TextInput source="description" label="Описание" fullWidth />
      <TextInput source="linkUrl" label="Ссылка" fullWidth />
      <FileSelector source="miniatureUrl" label="Миниатюра (URL)" />
      <DateInput source="endDate" label="Дата окончания" />
    </SimpleForm>
  </Edit>
);

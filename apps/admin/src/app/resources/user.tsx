/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  Filter,
  DateInput,
  NumberInput,
  SelectInput,
  EmailField,
  DateField,
  NumberField,
  SelectField,
  SimpleShowLayout,
  Show,
  TopToolbar,
  Button,
  useRecordContext,
  BooleanField,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput,
  BooleanInput,
  ReferenceManyField,
} from 'react-admin';
import { CustomDeleteButton } from '../components/buttons';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';

enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

enum UserRole {
  User = 'User',
  Moderator = 'Moderator',
  Admin = 'Admin',
}

enum SubscriptionType {
  FREE = 'free',
  TRIAL = 'trial',
  PREMIUM = 'premium',
}

const UserGenderTitles: Record<UserGender, string> = {
  [UserGender.MALE]: 'Мужчина',
  [UserGender.FEMALE]: 'Женщина',
};

const UserRoleTitles: Record<UserRole, string> = {
  [UserRole.User]: 'Ученик',
  [UserRole.Moderator]: 'Модератор',
  [UserRole.Admin]: 'Администратор',
};

const SubscriptionTypeTitles: Record<SubscriptionType, string> = {
  [SubscriptionType.FREE]: 'Бесплатная',
  [SubscriptionType.TRIAL]: 'Пробная',
  [SubscriptionType.PREMIUM]: 'Премиум',
};

// 🔹 Фильтр
const UserFilter = (props: any) => (
  <Filter {...props}>
    {/* Основные фильтры */}
    <TextInput label="Email" source="email" />
    <SelectInput
      label="Роль"
      source="role"
      choices={Object.entries(UserRole).map(([key, value]) => ({
        id: value,
        name: UserRoleTitles[value],
      }))}
    />

    {/* Фильтры по подписке */}
    <SelectInput
      label="Подписка"
      source="subscription.type"
      choices={Object.entries(SubscriptionType).map(([key, value]) => ({
        id: value,
        name: SubscriptionTypeTitles[value],
      }))}
    />

    {/* Прочие фильтры */}
    <TextInput label="Username" source="username" alwaysOn />
    <NumberInput source="tgId" label="Telegram ID" />
    <BooleanInput source="banned" label="Заблокирован" />
  </Filter>
);

export const UserDatagrid = () => (
  <Datagrid rowClick="show" bulkActionButtons={false}>
    <NumberField source="userId" label="ID" />
    <SelectField
      source="subscription.type"
      label="Подписка"
      choices={Object.entries(SubscriptionType).map(([key, value]) => ({
        id: value,
        name: SubscriptionTypeTitles[value],
      }))}
    />
    <NumberField source="tgId" label="Telegram ID" />
    <TextField source="name" label="Имя" />
    <TextField source="username" label="Username" />
    <NumberField source="balance" label="Баланс" />
    <EmailField source="email" label="Email" />
    <DateField source="birthDate" label="Дата рождения" />
    <NumberField source="height" label="Рост" />
    <NumberField source="weight" label="Вес" />
    <SelectField
      source="gender"
      label="Пол"
      choices={Object.entries(UserGender).map(([key, value]) => ({
        id: value,
        name: UserGenderTitles[value],
      }))}
    />
    <SelectField
      source="role"
      label="Роль"
      choices={Object.entries(UserRole).map(([key, value]) => ({
        id: value,
        name: UserRoleTitles[value],
      }))}
    />

    <BooleanField source="banned" label="Заблокирован" />
  </Datagrid>
);

export const UserList = () => (
  <List
    filters={<UserFilter />}
    perPage={25}
    sort={{ field: 'userId', order: 'ASC' }}
  >
    <UserDatagrid />
  </List>
);

const TrainingShowActions = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  const handleEditTraining = () => {
    navigate(`/user/${record.userId}`);
  };

  return (
    <TopToolbar>
      <Button
        label="Редактировать"
        onClick={handleEditTraining}
        startIcon={<EditIcon />}
      />
      <CustomDeleteButton
        parentResource="user"
        resource="user"
        record={record}
        confirm={(record) =>
          `Вы уверены, что хотите удалить пользователя?\nЭто действие необратимо.\nВсе рефералы этого пользователя перейдут в рефералы пригласителя этого пользователя.\nПродолжить?`
        }
      />
    </TopToolbar>
  );
};

export const UserShow = () => {
  const record = useRecordContext(); // текущий пользователь

  return (
    <Show actions={<TrainingShowActions />}>
      <SimpleShowLayout>
        <NumberField source="userId" label="ID" />
        <NumberField source="tgId" label="Telegram ID" />
        <TextField source="name" label="Имя" />
        <TextField source="username" label="Username" />
        <SelectField
          source="subscription.type"
          label="Подписка"
          choices={Object.entries(SubscriptionType).map(([key, value]) => ({
            id: value,
            name: SubscriptionTypeTitles[value],
          }))}
        />
        <NumberField source="balance" label="Баланс" />
        <EmailField source="email" label="Email" />
        <DateField source="birthDate" label="Дата рождения" />
        <NumberField source="height" label="Рост" />
        <NumberField source="weight" label="Вес" />
        <SelectField
          source="gender"
          label="Пол"
          choices={Object.entries(UserGender).map(([key, value]) => ({
            id: value,
            name: UserGenderTitles[value],
          }))}
        />
        <SelectField
          source="role"
          label="Роль"
          choices={Object.entries(UserRole).map(([key, value]) => ({
            id: value,
            name: UserRoleTitles[value],
          }))}
        />
        {/* Пользователь */}
        <ReferenceField
          label="Пригласитель"
          reference="user"
          link="show"
          source="partnerId"
        >
          <TextField source="userId" />: @<TextField source="username" /> -{' '}
          <TextField source="name" />
        </ReferenceField>

        {/* Список рефералов */}
        <ReferenceManyField
          label="Рефералы"
          reference="user"
          target="partnerId"
        >
          <UserDatagrid />
        </ReferenceManyField>

        <TextField source="address" label="Адрес" />

        <BooleanField source="banned" label="Заблокирован" />
      </SimpleShowLayout>
    </Show>
  );
};

export const UserEdit = () => (
  <Edit
    redirect={(basePath, id) => (id ? `/user/${id}/show` : 'training')}
    mutationMode="pessimistic"
  >
    <SimpleForm>
      {/* Только для чтения */}
      <NumberInput source="userId" disabled label="ID" />
      <NumberInput source="tgId" disabled label="Telegram ID" />
      <TextInput source="name" disabled label="Имя" />
      <TextInput source="username" disabled label="Username" />
      <TextInput source="subscription.type" label="Подписка" disabled />
      <TextInput source="address" disabled label="Адрес" />

      {/* Можно редактировать */}
      <NumberInput source="balance" label="Баланс" />
      <TextInput source="email" label="Email" />
      <DateInput source="birthDate" label="Дата рождения" />
      <NumberInput source="height" label="Рост" />
      <NumberInput source="weight" label="Вес" />
      <SelectInput
        source="gender"
        choices={Object.entries(UserGender).map(([key, value]) => ({
          id: value,
          name: UserGenderTitles[value],
        }))}
        label="Пол"
      />
      <SelectInput
        source="role"
        label="Роль"
        choices={Object.entries(UserRole).map(([key, value]) => ({
          id: value,
          name: UserRoleTitles[value],
        }))}
      />

      {/* ReferenceInput для партнера */}
      <ReferenceInput
        label="Пригласитель"
        source="partnerId"
        reference="user"
        sort={{ field: 'userId', order: 'ASC' }}
        allowEmpty
      >
        <AutocompleteInput
          optionText={(r) =>
            r?.userId ? `${r.userId}: @${r.username} — ${r.name}` : 'Нет'
          }
          optionValue="userId"
          fullWidth
          emptyText="Нет"
        />
      </ReferenceInput>

      {/* Поля для изменения пароля и пина */}
      <TextInput source="password" label="Пароль" />
      <TextInput source="finPassword" label="Фин. Пароль" />
      <TextInput source="pin" label="PIN" />

      <BooleanInput source="banned" label="Заблокирован" />
    </SimpleForm>
  </Edit>
);

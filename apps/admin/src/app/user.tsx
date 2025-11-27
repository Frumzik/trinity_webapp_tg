/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  Datagrid,
  TextField,
  EditButton,
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
} from 'react-admin';

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
      choices={[
        { id: UserRole.User, name: UserRoleTitles[UserRole.User] },
        { id: UserRole.Moderator, name: UserRoleTitles[UserRole.Moderator] },
        { id: UserRole.Admin, name: UserRoleTitles[UserRole.Admin] },
      ]}
    />
    <SelectInput
      label="Пол"
      source="gender"
      choices={[
        { id: UserGender.MALE, name: UserGenderTitles[UserGender.MALE] },
        { id: UserGender.FEMALE, name: UserGenderTitles[UserGender.FEMALE] },
      ]}
    />

    {/* Фильтры по подписке */}
    <SelectInput
      label="Подписка"
      source="subscription.type"
      choices={[
        { id: SubscriptionType.FREE, name: SubscriptionTypeTitles[SubscriptionType.FREE] },
        { id: SubscriptionType.TRIAL, name: SubscriptionTypeTitles[SubscriptionType.TRIAL] },
        { id: SubscriptionType.PREMIUM, name: SubscriptionTypeTitles[SubscriptionType.PREMIUM] },
      ]}
    />

    {/* Прочие фильтры */}
    <TextInput label="Имя" source="name" />
    <TextInput label="Username" source="username" alwaysOn/>
    <TextInput label="Адрес" source="address" />
    <NumberInput label="Telegram ID" source="tgId" />
    <NumberInput label="Баланс от" source="balance_gte" />
    <NumberInput label="Баланс до" source="balance_lte" />
    <DateInput label="Дата рождения с" source="birthDate_gte" />
    <DateInput label="Дата рождения по" source="birthDate_lte" />
  </Filter>
);

export const UserList = () => (
  <List
    filters={<UserFilter />}
    perPage={25}
    sort={{ field: 'userId', order: 'ASC' }}
  >
    <Datagrid rowClick="edit">
      <NumberField source="userId" label="ID" />
      <SelectField
        source="subscription.type"
        label="Подписка"
        choices={[
          {
            id: SubscriptionType.FREE,
            name: SubscriptionTypeTitles[SubscriptionType.FREE],
          },
          {
            id: SubscriptionType.TRIAL,
            name: SubscriptionTypeTitles[SubscriptionType.TRIAL],
          },
          {
            id: SubscriptionType.PREMIUM,
            name: SubscriptionTypeTitles[SubscriptionType.PREMIUM],
          },
        ]}
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
        choices={[
          { id: UserGender.MALE, name: UserGenderTitles[UserGender.MALE] },
          { id: UserGender.FEMALE, name: UserGenderTitles[UserGender.FEMALE] },
        ]}
      />
      <SelectField
        source="role"
        label="Роль"
        choices={[
          { id: UserRole.User, name: UserRoleTitles[UserRole.User] },
          { id: UserRole.Moderator, name: UserRoleTitles[UserRole.Moderator] },
          { id: UserRole.Admin, name: UserRoleTitles[UserRole.Admin] },
        ]}
      />

      <TextField source="address" label="Адрес" />
      <EditButton />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      {/* Только для чтения */}
      <NumberInput source="userId" disabled label="ID" />
      <NumberInput source="tgId" disabled label="Telegram ID" />
      <TextInput source="name" disabled label="Имя" />
      <TextInput source="username" disabled label="Username" />
      <TextInput
        source="subscription.type"
        label="Подписка"
        disabled
      />
      <TextInput source="address" disabled label="Адрес" />

      {/* Можно редактировать */}
      <NumberInput source="balance" label="Баланс" />
      <TextInput source="email" label="Email" />
      <DateInput source="birthDate" label="Дата рождения" />
      <NumberInput source="height" label="Рост" />
      <NumberInput source="weight" label="Вес" />
      <SelectInput
        source="gender"
        choices={[
          { id: UserGender.MALE, name: UserGenderTitles[UserGender.MALE] },
          { id: UserGender.FEMALE, name: UserGenderTitles[UserGender.FEMALE] },
        ]}
        label="Пол"
      />
      <SelectInput
        source="role"
        label="Роль"
        choices={[
          { id: UserRole.User, name: UserRoleTitles[UserRole.User] },
          { id: UserRole.Moderator, name: UserRoleTitles[UserRole.Moderator] },
          { id: UserRole.Admin, name: UserRoleTitles[UserRole.Admin] },
        ]}
      />

      {/* Поля для изменения пароля и пина */}
      <TextInput source="password" label="Пароль" />
      <TextInput source="finPassword" label="Фин. Пароль" />
      <TextInput source="pin" label="PIN" />
    </SimpleForm>
  </Edit>
);

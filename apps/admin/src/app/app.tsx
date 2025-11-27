import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import { authProvider } from './authProvider';
import { httpClient } from './httpClient';
// Импорт кастомных компонентов (можно оставить ListGuesser на первых порах)
import { UserList, UserEdit, UserCreate } from './user';

// URL должен вести на твой backend /admin
const dataProvider = simpleRestProvider(
  `${import.meta.env.VITE_API_URL}/admin`,
  httpClient
);

export default function App() {
  return (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
      {/* Пользователи */}
      <Resource
        name="user"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
      />

      {/* Можно добавить другие ресурсы */}
      {/* <Resource name="trainings" list={TrainingList} /> */}
      {/* <Resource name="subscriptions" list={SubscriptionList} /> */}
    </Admin>
  );
}

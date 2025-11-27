import { Admin, Layout, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import { authProvider } from './authProvider';
import { httpClient } from './httpClient';
// Импорт кастомных компонентов (можно оставить ListGuesser на первых порах)
import { UserList, UserEdit } from './user';
import { MyMenu } from './menu';
import { Dashboard } from './dashboard';

// URL должен вести на твой backend /admin
const dataProvider = simpleRestProvider(
  `${import.meta.env.VITE_API_URL}/admin`,
  httpClient
);

export default function App() {
  return (
    <Admin
      title="Trinity"
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      layout={(props) => <Layout {...props} menu={MyMenu} />}
    >
      <Resource
        name="user"
        list={UserList}
        edit={UserEdit}
        options={{ label: 'Пользователи' }}
      />
    </Admin>
  );
}

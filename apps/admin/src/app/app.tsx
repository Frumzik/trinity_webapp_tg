import { Admin, Resource, ListGuesser } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import { authProvider } from "./authProvider";
import { httpClient } from "./httpClient";

const dataProvider = simpleRestProvider(import.meta.env.VITE_API_URL, httpClient);

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
    >
      <Resource name="posts" list={ListGuesser} />
    </Admin>
  );
}

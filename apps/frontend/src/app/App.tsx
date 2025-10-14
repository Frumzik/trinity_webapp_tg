import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "../shared/styles/main.scss";

export default function App() {
  return <RouterProvider router={router} />;
}

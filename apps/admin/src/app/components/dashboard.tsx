import { Card, CardContent, Typography } from "@mui/material";
import { Title } from "react-admin";

export const Dashboard = () => (
  <Card>
    <Title title="Дашборд" />
    <CardContent>
      <Typography variant="h5">Добро пожаловать в админку!</Typography>
      <Typography>Выберите раздел в меню слева, чтобы начать.</Typography>
    </CardContent>
  </Card>
);

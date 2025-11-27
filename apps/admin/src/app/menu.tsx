/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu, useSidebarState } from 'react-admin';
import { MenuItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const MyMenu = () => {
  const [openTrainings, setOpenTrainings] = useState(false);
  const [sidebarOpen] = useSidebarState();
  const [trainings, setTrainings] = useState([]);

  // Получаем список тренингов с бэка
  useEffect(() => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/content/trainings`,
        {
          filter: { parentId: null },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      ) // путь к вашему API
      .then((res) => setTrainings(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Menu>
      {/* Дашборд */}
      <MenuItem component={Link} to="/">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Дашборд" />
      </MenuItem>

      {/* Тренинги / Материалы */}
      <MenuItem onClick={() => setOpenTrainings(!openTrainings)}>
        <ListItemIcon>
          <BookIcon />
        </ListItemIcon>
        <ListItemText primary="Материалы" />
        {openTrainings ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      <Collapse in={openTrainings && sidebarOpen} timeout="auto" unmountOnExit>
        {trainings.map((t) => (
          <MenuItem
            key={(t as any).trainingId}
            component={Link}
            to={`/training/${(t as any).trainingId}/show`}
            sx={{ pl: 4 }}
          >
            <ListItemText primary={`• ${(t as any).title}`} />{' '}
            {/* Черточка/точка */}
          </MenuItem>
        ))}
      </Collapse>

      {/* Пользователи */}
      <MenuItem component={Link} to="/user">
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Пользователи" />
      </MenuItem>
    </Menu>
  );
};

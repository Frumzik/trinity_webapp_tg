/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu, useDataProvider, useSidebarState } from 'react-admin';
import { MenuItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';

export const MyMenu = () => {
  const [openTrainings, setOpenTrainings] = useState(false);
  const [sidebarOpen] = useSidebarState();
  const [trainings, setTrainings] = useState<any>([]);

  const dataProvider = useDataProvider();

  // Получаем список тренингов с бэка
  useEffect(() => {
    dataProvider
      .getList('training', {
        sort: { field: 'id', order: 'ASC' },
        filter: { parentId: null },
      })
      .then(({ data }) => setTrainings(data))
      .catch((error) => console.error(error));
  }, [dataProvider]);

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
        {trainings.map((t: any) => (
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

      {/* Баннеры */}
      <MenuItem component={Link} to="/banner">
        <ListItemIcon>
          <ImageIcon />
        </ListItemIcon>
        <ListItemText primary="Баннеры" />
      </MenuItem>

      {/* Файлы */}
      <MenuItem
        component={Link}
        to="/file?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=LastModified"
      >
        <ListItemIcon>
          <InsertDriveFileIcon />
        </ListItemIcon>
        <ListItemText primary="Файлы" />
      </MenuItem>
    </Menu>
  );
};

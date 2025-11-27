import { Menu, useSidebarState } from 'react-admin';
import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const MyMenu = () => {
  const [openTrainings, setOpenTrainings] = useState(false);
  const [sidebarOpen] = useSidebarState();

  return (
    <Menu>
      {/* Дашборд */}
      <MenuItem component={Link} to="/">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Дашборд" />
      </MenuItem>

      {/* Тренинги */}
      <MenuItem onClick={() => setOpenTrainings(!openTrainings)}>
        <ListItemIcon>
          <BookIcon />
        </ListItemIcon>
        <ListItemText primary="Тренинги" />
        {openTrainings ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      <Collapse in={openTrainings && sidebarOpen} timeout="auto" unmountOnExit>
        <MenuItem
          component={Link}
          to="/trainings/steps-of-spirit"
          sx={{ pl: 4 }}
        >
          <ListItemIcon>
            <Typography variant="body2">•</Typography>
          </ListItemIcon>
          <ListItemText primary="Ступени духа" />
        </MenuItem>
        <MenuItem component={Link} to="/trainings/practices" sx={{ pl: 4 }}>
          <ListItemIcon>
            <Typography variant="body2">•</Typography>
          </ListItemIcon>
          <ListItemText primary="Практики" />
        </MenuItem>
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

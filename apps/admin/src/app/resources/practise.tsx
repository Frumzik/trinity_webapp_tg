/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ReferenceField,
  BooleanField,
  Button,
  useRecordContext,
  useDataProvider,
  useRefresh,
  useNotify,
  FunctionField,
  RaRecord,
  Filter,
  NumberInput,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
} from 'react-admin';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';


interface PractiseButtonsProps {
  record?: RaRecord; // рекорд можно передать через пропсы
}
export const PractiseButtons = ({
  record: propRecord,
}: PractiseButtonsProps) => {
  const recordFromContext = useRecordContext();
  const record = propRecord || recordFromContext;

  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  if (!record) return null;

  const handleAcceptClick = async () => {
    try {
      await dataProvider.update('practise', {
        id: record.reserveId,
        previousData: record,
        data: { ...record, accepted: true },
      });
      notify('Запись одобрена', { type: 'info' });
      refresh();
    } catch (err) {
      console.error(err);
      notify('Ошибка при одобрении', { type: 'error' });
    }
  };

  const handleDoneClick = async () => {
    try {
      await dataProvider.update('practise', {
        id: record.reserveId,
        previousData: record,
        data: { ...record, done: true },
      });

      notify('Запись проведена', { type: 'info' });
      setTimeout(() => {
        refresh();
      }, 500);
      refresh();
    } catch (err) {
      console.error(err);
      notify('Ошибка при проведении', { type: 'error' });
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Удалить запись?')) return;

    try {
      await dataProvider.delete('practise', {
        id: record.reserveId,
        previousData: record,
      });
      notify('Запись удалена', { type: 'info' });
      refresh();
    } catch (err) {
      console.error(err);
      notify('Ошибка при удалении', { type: 'error' });
    }
  };

  const buttonStyle = {
    minWidth: 0,
    width: 40,
    height: 40,
    padding: 0,
    '& .MuiButton-startIcon': {
      margin: 0,
    },
  };

  const buttonDoneStyle = {
    minWidth: 0,
    width: 140,
    height: 40,
    padding: 0,
    '& .MuiButton-startIcon': {
      margin: 0,
    },
  };

  return (
    <div
      style={{
        display: 'flex',
        width: 190, // фиксированная ширина под 2 кнопки
        justifyContent: 'space-between',
      }}
    >
      {/* Место под кнопку подтверждения — ВСЕГДА есть */}
      <div style={{ width: 120, height: 40 }}>
        {!record.accepted && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAcceptClick}
            sx={buttonDoneStyle}
          >
            <DoneIcon sx={{mr: 0.25}}/>
            Принять
          </Button>
        )}
        {record.accepted && (
          <Button
            variant="contained"
            color="success"
            onClick={handleDoneClick}
            sx={buttonDoneStyle}
          >
            <DoneIcon sx={{mr: 0.25}}/>
            Выполнить
          </Button>
        )}
      </div>

      {/* Кнопка удаления — всегда справа */}
      <div style={{ width: 40, height: 40 }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteClick}
          sx={buttonStyle}
        >
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
};

export const PractiseFilter = (props: any) => (
  <Filter {...props}>
    <NumberInput label="ID" source="reserveId" alwaysOn />

    <ReferenceInput
      label="Пользователь"
      source="userId"
      reference="user"
      sort={{ field: 'userId', order: 'ASC' }}
    >
      <AutocompleteInput
        label="Пользователь"
        optionText={(record) =>
          `${record.userId}: @${record.username} — ${record.name}`
        }
        optionValue="userId"
        fullWidth
      />
    </ReferenceInput>

    <BooleanInput label="Только на модерации" source="accepted" />
  </Filter>
);

/* -------------------------------------- */
/*               LIST                     */
/* -------------------------------------- */

export const PractiseList = () => (
  <List
    sort={{ field: 'reserveId', order: 'DESC' }}
    filters={<PractiseFilter />}
  >
    <Datagrid bulkActionButtons={false}>
      <NumberField source="reserveId" label="ID" />

      {/* Пользователь */}
      <ReferenceField
        source="userId" // поле в Practise
        reference="user" // ресурс для запроса
        link="show" // ссылка на просмотр пользователя
        label="Пользователь"
      >
        <TextField source="userId" />: @<TextField source="username" /> -{' '}
        <TextField source="name" />
      </ReferenceField>

      <ReferenceField
        source="trainingId" // поле в Practise
        reference="training" // ресурс для запроса
        link="show" // ссылка на просмотр пользователя
        label="Практика"
      >
        <TextField source="trainingId" /> - <TextField source="title" />
      </ReferenceField>

      <DateField source="createdAt" label="Дата создания" />

      <BooleanField source="accepted" label="Подтверждена" />

      {/* Кнопки в отдельной колонке */}
      <FunctionField
        label="Действия"
        render={(record) => <PractiseButtons record={record} />}
      />
    </Datagrid>
  </List>
);

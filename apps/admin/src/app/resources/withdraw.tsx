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
  TextInput,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
  Title,
} from 'react-admin';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import { Card, CardContent, Typography } from '@mui/material';

interface WithdrawButtonsProps {
  record?: RaRecord; // рекорд можно передать через пропсы
}
export const WithdrawButtons = ({
  record: propRecord,
}: WithdrawButtonsProps) => {
  const recordFromContext = useRecordContext();
  const record = propRecord || recordFromContext;

  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  if (!record) return null;

  const handleAcceptClick = async () => {
    try {
      await dataProvider.update('withdraw', {
        id: record.withdrawId,
        previousData: record,
        data: { ...record, needModeration: false },
      });
      notify('Запись одобрена', { type: 'info' });
      refresh();
    } catch (err) {
      console.error(err);
      notify('Ошибка при одобрении', { type: 'error' });
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Удалить запись?')) return;

    try {
      await dataProvider.delete('withdraw', {
        id: record.withdrawId,
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

  return (
    <div
      style={{
        display: 'flex',
        width: 90, // фиксированная ширина под 2 кнопки
        justifyContent: 'space-between',
      }}
    >
      {/* Место под кнопку подтверждения — ВСЕГДА есть */}
      <div style={{ width: 40, height: 40 }}>
        {record.needModeration && (
          <Button
            variant="contained"
            color="success"
            onClick={handleAcceptClick}
            sx={buttonStyle}
          >
            <DoneIcon />
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

export const WithdrawFilter = (props: any) => (
  <Filter {...props}>
    <NumberInput label="ID" source="withdrawId" alwaysOn />

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

    <TextInput label="Кошелёк" source="toAddress" />
    <BooleanInput label="Только на модерации" source="needModeration" />
  </Filter>
);

/* -------------------------------------- */
/*               LIST                     */
/* -------------------------------------- */
export const WithdrawList = () => {
  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  const isProduction = nodeEnv === 'production';
  // const isProduction = true;

  return isProduction ? (
      <List
        sort={{ field: 'withdrawId', order: 'DESC' }}
        filters={<WithdrawFilter />}
      >
        <Datagrid bulkActionButtons={false}>
          <NumberField source="withdrawId" label="ID" />

          {/* Пользователь */}
          <ReferenceField
            source="userId" // поле в Withdraw
            reference="user" // ресурс для запроса
            link="show" // ссылка на просмотр пользователя
            label="Пользователь"
          >
            <TextField source="userId" />: @<TextField source="username" /> -{' '}
            <TextField source="name" />
          </ReferenceField>

          <TextField source="toAddress" label="Адрес" />
          <NumberField source="amount" label="Сумма" />
          <DateField source="date" label="Дата" />

          <BooleanField source="needModeration" label="На модерации" />

          {/* Кнопки в отдельной колонке */}
          <FunctionField
            label="Действия"
            render={(record) => <WithdrawButtons record={record} />}
          />
        </Datagrid>
      </List>
  ) : (
    <Card>
      <Title title="Ошибка" />
      <CardContent>
        <Typography variant="h5">
          Модерирование выводов доступно только на production версии
        </Typography>
        <Typography>Текущая версия: {nodeEnv}</Typography>
      </CardContent>
    </Card>
  );
};

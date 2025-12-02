/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  useRecordContext,
  FunctionField,
  useNotify,
  useRefresh,
  useDataProvider,
  SimpleForm,
  Toolbar,
  SaveButton,
  TextInput,
  NumberInput,
  FormDataConsumer,
  DateField,
  ReferenceField,
} from 'react-admin';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';

import MoneyIcon from '@mui/icons-material/Money';
import { useState } from 'react';

export const WithdrawButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const [open, setOpen] = useState(false);

  if (!record) return null;

  const handleSubmit = async (values: any) => {
    try {
      await dataProvider.create('fund', {
        data: {
          fundType: record.type,
          toAddress: values.toAddress,
          amount: values.amount,
        },
      });

      notify('Заявка на вывод создана', { type: 'success' });
      setOpen(false);
      refresh();
    } catch (e) {
      console.error(e);
      notify('Ошибка при создании вывода', { type: 'error' });
    }
  };

  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  const isProduction = nodeEnv === 'production';
  // const isProduction = true;

  return isProduction ? (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        <MoneyIcon /> Вывод
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Создать вывод</DialogTitle>

        <DialogContent>
          <SimpleForm
            onSubmit={handleSubmit}
            toolbar={
              <Toolbar>
                <Button onClick={() => setOpen(false)}>Отмена</Button>
                <SaveButton alwaysEnable />
              </Toolbar>
            }
          >
            <FormDataConsumer>
              {({ formData }) => (
                <input
                  type="hidden"
                  name="fundType"
                  value={formData.fundType}
                  readOnly
                />
              )}
            </FormDataConsumer>

            <TextInput
              source="toAddress"
              label="Адрес кошелька"
              fullWidth
              validate={(value) => (value ? undefined : 'Обязательное поле')}
            />

            <NumberInput
              source="amount"
              label="Сумма"
              fullWidth
              min={0}
              validate={(value) =>
                value && Number(value) > 0 ? undefined : 'Введите сумму'
              }
            />
          </SimpleForm>
        </DialogContent>

        <DialogActions />
      </Dialog>
    </>
  ) : null;
};

/* -------------------------------------- */
/*               LIST                     */
/* -------------------------------------- */

export const TransactionList = () => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <h3>Транзакции</h3>
        <List
          resource="transaction"
          filter={{ type: 'Fund' }} // type !== FUND
          actions={false}
        >
          <Datagrid rowClick={false} bulkActionButtons={false}>
            <TextField source="transactionId" label="ID" />
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
            <NumberField source="sum" label="Сумма" />
            <TextField source="toAddress" label="Адрес" />
            <DateField source="createdAt" showTime label="Дата"/>
          </Datagrid>
        </List>
      </CardContent>
    </Card>
  );
};

export const FundList = () => (
  <>
    <List>
      <Datagrid bulkActionButtons={false}>
        <TextField source="title" label="Фонд" />
        <NumberField source="balance" label="Баланс" />
        <NumberField source="earn" label="Заработок" />

        {/* Кнопки в отдельной колонке */}
        <FunctionField
          label="Действия"
          render={(record) => <WithdrawButton />}
        />
      </Datagrid>
    </List>
    <TransactionList />
  </>
);

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AutocompleteInput,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  FunctionField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  SimpleFormIterator,
  TextField,
  TextInput,
} from 'react-admin';

enum ContentAccessType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME_PAYMENT = 'one_time_payment',
  TRAINING_PURCHASED = 'training_purchased',
  FREE = 'free',
  DATE_UNLOCK = 'date_unlock',
  TRAINING_COMPLETED = 'training_completed',
  LESSON_COMPLETED = 'lesson_completed',
}

const ContentAccessTitles: Record<ContentAccessType, string> = {
  [ContentAccessType.SUBSCRIPTION]: 'Нужна подписка',
  [ContentAccessType.ONE_TIME_PAYMENT]: 'Нужно купить',
  [ContentAccessType.TRAINING_PURCHASED]: 'Тренинг куплен',
  [ContentAccessType.FREE]: 'Бесплатно',
  [ContentAccessType.DATE_UNLOCK]: 'После даты',
  [ContentAccessType.TRAINING_COMPLETED]: 'Тренинг пройден',
  [ContentAccessType.LESSON_COMPLETED]: 'Урок пройден',
};

/* Условия доступа */
export const AccessRulesDatagrid = () => (
  <Datagrid bulkActionButtons={false} empty={<span>Пусто</span>}>
    <FunctionField
      label="Тип"
      render={(record) =>
        ContentAccessTitles[record.type as ContentAccessType] || record.type
      }
    />
    <TextField source="description" label="Описание" />
    <FunctionField
      label="Значение"
      render={(record) => {
        switch (record.type) {
          case ContentAccessType.TRAINING_PURCHASED:
          case ContentAccessType.TRAINING_COMPLETED:
            return record.value ? (
              <ReferenceField reference="training" source="value" link="show">
                <TextField source="title" />
              </ReferenceField>
            ) : (
              '—'
            );

          case ContentAccessType.LESSON_COMPLETED:
            return record.value ? (
              <ReferenceField reference="lesson" source="value" link="show">
                <TextField source="title" />
              </ReferenceField>
            ) : (
              '—'
            );

          case ContentAccessType.DATE_UNLOCK:
            return record.value ? (
              <DateField source="value" record={record} />
            ) : (
              '—'
            );

          default:
            return '—';
        }
      }}
    />
  </Datagrid>
);

const accessTypeChoices = Object.entries(ContentAccessTitles).map(
  ([key, name]) => ({ id: key, name })
);

export const AccessRulesInput = () => (
  <SimpleFormIterator>
    <SelectInput source="type" choices={accessTypeChoices} label="Тип" />
    <TextInput source="description" label="Описание" />

    {/* Динамическое поле value */}
    <FormDataConsumer>
      {({ formData, scopedFormData, ...rest }) => {
        const type = scopedFormData?.type;

        switch (type) {
          case ContentAccessType.TRAINING_PURCHASED:
          case ContentAccessType.TRAINING_COMPLETED:
            return (
              <ReferenceInput
                source="value"
                reference="training"
                {...rest}
                label="Тренинг"
              >
                <AutocompleteInput
                  optionText={(record: any) =>
                    `${record.trainingId}: ${record.title}`
                  }
                  label="Тренинг"
                />
              </ReferenceInput>
            );
          case ContentAccessType.LESSON_COMPLETED:
            return (
              <ReferenceInput
                source="value"
                reference="lesson"
                {...rest}
                label="Урок"
              >
                <AutocompleteInput
                  optionText={(record: any) =>
                    `${record.lessonId}: ${record.title}`
                  }
                  label="Урок"
                />
              </ReferenceInput>
            );
          case ContentAccessType.DATE_UNLOCK:
            return <DateInput source="value" label="Дата" {...rest} />;
          default:
            return;
        }
      }}
    </FormDataConsumer>
  </SimpleFormIterator>
);

import { RichTextInput } from 'ra-input-rich-text';
import { Create, SimpleForm } from 'react-admin';

export const MailingCreate = () => (
  <Create title="Создать рассылку">
    <SimpleForm>
      <RichTextInput source="text" label="Текст" />
    </SimpleForm>
  </Create>
);

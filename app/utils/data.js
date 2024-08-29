export const initialContactFields = {
  name: '',
  email: '',
  topic: '',
  message: ''
}

export const FieldType = {
  TEXT: "text",
  EMAIL: "email",
  TEXTAREA: "textarea",
  NUMBER: "number",
  SELECT: "select",
  RADIO: "radio",
  CHECKBOX: "checkbox",
}

export const TextTypes = [FieldType.TEXT, FieldType.EMAIL, FieldType.TEXTAREA];

export const initialFields = {
  fieldName: '',
  fieldLabel: '',
  placeholder: '',
  defaultValue: '',
  fieldType: FieldType.TEXT,
  totalLines: 4,
  min: '',
  max: '',
  isRequired: false,
  selectOptions: []
}

export const initialFormValues = {
  heading: 'New Form',
  description: 'Enter Form Description',
  showTitle: true
}

export const getNewField = () => ({
  fieldName: '',
  fieldLabel: '',
  placeholder: '',
  defaultValue: '',
  fieldType: FieldType.TEXT,
  totalLines: 4,
  min: '',
  max: '',
  isRequired: false,
  selectOptions: []
})
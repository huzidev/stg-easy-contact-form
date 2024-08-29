export async function saveMetaFields(contact, session, admin) {
  try {
    const metafield = new admin.rest.resources.Metafield({
      session,
    });
    const response = await contact.getForms();
    const { forms } = response;

    const publishedForms = forms.filter((form) => form.onlinePublish);
    const formattedForms = publishedForms.map((form) => ({
      formId: form.id,
      title: form.name,
      fields: form.fields.map((field) => ({
        id: field.id,
        name: field.fieldName,
        label: field.fieldLabel,
        placeholder: field.placeholder,
        defaultValue: field.defaultValue,
        type: field.fieldType,
        isRequired: field.isRequired,
        options:
          field.options?.map((option) => ({
            id: option.id,
            label: option.label,
            value: option.value,
          })) || [],
      })),
    }));

    metafield.namespace = "swllc";
    metafield.key = "forms";
    metafield.type = "json";
    metafield.value = JSON.stringify(formattedForms);

    const res = await metafield.save({
      update: true,
    });

    return res;
  } catch (error) {
    console.error("Error saving metafield:", error);
    throw error;
  }
}

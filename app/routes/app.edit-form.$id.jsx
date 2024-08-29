import { json, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Page,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import FormHeader from "../component/FormHeader";
import Preview from "../component/Preview";
import SidebarField from "../component/SidebarField";
import { saveMetaFields } from "../jobs/SaveMetaFields";
import Contact from "../models/Contact.server";
import { authenticate } from "../shopify.server";
import { getNewField } from "../utils/data";

export async function loader({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);

  const { id } = params;
  // const { fieldStatus, formFields } = await contact.getFields(id);
  const response = await contact.getFields(id);
  const { form } = await contact.getForm(id);

  return json({
    ...response,
    form,
  });
}

export async function action({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);
  const { id } = params;
  const { action, fields, fromValues, deleteFieldsId, publishType } =
    await request.json();

  let response;
  if (action === "publish-form") {
    response = await contact.publishForm(publishType, id);
  } else {
    let addFields = fields.filter((val) => !val.id);
    let editFields = fields.filter((val) => val.id);
    if (!!addFields.length) {
      response = await contact.addField(addFields, id);
    }
    response = await contact.editFields(editFields, id);
    response = await contact.editForm(fromValues, id);
    if (!!deleteFieldsId.length) {
      response = await contact.deleteFields(deleteFieldsId);
    }
  }
  await saveMetaFields(contact, session, admin);

  const isSuccess = response?.status === 200;
  const message = response?.message;

  return json({
    response,
    isSuccess,
    message,
  });
}

export default function Forms() {
  const { formFields, form } = useLoaderData();
  const [fields, setFields] = useState(formFields || []);
  const [fromValues, setFormValues] = useState(form);
  const { heading, description, showTitle } = fromValues;
  const [loading, setLoading] = useState({
    type: "",
    state: false,
  });
  const [isFormPublished, setFormPublished] = useState(
    form?.onlinePublish ?? false,
  );
  const [deleteFieldsId, setDeleteFieldsId] = useState([]);
  const submit = useSubmit();
  const navigate = useNavigate();

  function handleChange(name, value) {
    setFormValues((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  }

  const addField = useCallback(() => {
    setFields([...fields, getNewField()]);
  }, [fields, setFields]);
  
  function handleUpdate(type) {
    if (!fields.length) {
      shopify.toast.show("Please add at least one field");
      return;
    }
    const isFormPublish = type === "publish-form";
    setLoading({
      type,
      state: true,
    });
    if (isFormPublish) {
      setFormPublished(!isFormPublished);
    }
    submit(
      {
        publishType: isFormPublish ? !isFormPublished : isFormPublished,
        deleteFieldsId,
        fields,
        fromValues,
        action: type,
      },
      { method: "post", encType: "application/json", replace: true },
    );
  }

  return (
    <Page
      title={`Editing ${fromValues?.heading}`}
      backAction={{ content: "All Forms", url: "/app" }}
      primaryAction={{
        content: isFormPublished ? "Unpublish" : "Publish",
        onAction: () => handleUpdate("publish-form"),
        loading: loading.type == "publish-form" && !!loading.state,
        disabled: loading.state,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: () => navigate("/app"),
        },
        {
          content: "Save",
          onAction: () => handleUpdate("save-form"),
          loading: loading.type === "save-form" && !!loading.state,
          disabled: loading.state,
        },
      ]}
      fullWidth
    >
      <Grid>
        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 2, xl: 2 }}>
          <BlockStack gap="200">
            <Box width="100%">
              <FormHeader
                formTitle={heading}
                formDescription={description}
                showTitle={showTitle}
                handleChangeCallback={handleChange}
              />
            </Box>
            <Box width="100%">
              <Card>
                <BlockStack gap="500">
                  {fields.map((field, index) => {
                    const { fieldLabel, fieldType } = field;
                    return (
                      <>
                        <SidebarField
                          {...field}
                          index={index}
                          title={fieldLabel != "" ? fieldLabel : fieldType}
                          setFieldsCallback={setFields}
                          setLoadingCallback={setLoading}
                          setDeleteFieldsId={setDeleteFieldsId}
                        />
                        <Divider borderColor="border" />
                      </>
                    );
                  })}
                  <Button
                    onClick={() => addField()}
                    variant="primary"
                    fullWidth
                    icon={PlusIcon}
                  >
                    Add new field
                  </Button>
                </BlockStack>
              </Card>
            </Box>
          </BlockStack>
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 6, sm: 7, md: 7, lg: 8, xl: 8 }}>
          <Preview
            title={heading}
            showTitle={showTitle}
            formDescription={description}
            fields={fields}
          />
        </Grid.Cell>
      </Grid>
    </Page>
  );
}

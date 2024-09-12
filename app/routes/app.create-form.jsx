import { json, useActionData, useNavigate, useSubmit } from "@remix-run/react";
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
import { useCallback, useEffect, useState } from "react";
import FormHeader from "../component/FormHeader";
import Preview from "../component/Preview";
import SidebarField from "../component/SidebarField";
import { saveMetaFields } from "../jobs/SaveMetaFields";
import Contact from "../models/Contact.server";
import { authenticate } from "../shopify.server";
import { getNewField, initialFields, initialFormValues } from "../utils/data";

export async function action({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);
  const { action, fields, formValues } = await request.json();

  const isPublish = action === "publish-form";
  let response = await contact.createForm(isPublish, formValues, fields);
  const { form } = response;
  if (form?.onlinePublish) {
    // if form is published then save metafields
    await saveMetaFields(contact, session, admin);
  }
  
  return json({
    ...response
  })
}

export default function Forms() {
  const [fields, setFields] = useState([initialFields]);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [loading, setLoading] = useState({
    type: "",
    state: false,
  });
  const submit = useSubmit();
  const actionData = useActionData();
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

  console.log("SW fields in create form", fields);

  function handleCreate(type) {
    if (!fields.length) {
      shopify.toast.show("Please add at least one field");
      return;
    }
    setLoading({
      type,
      state: true,
    });
    submit(
      {
        fields,
        formValues,
        action: type,
      },
      { method: "post", encType: "application/json", replace: true },
    );
  }

  useEffect(() => {
    if (actionData?.status === 200) {
      const { form, message } = actionData;
      
      navigate(`/app/edit-form/${form?.id}`);
      setLoading({
        type: "",
        state: false,
      });
      shopify.toast.show(message);
    }
  }, [actionData]);

  const isFormPublished = loading.type === "publish-form";

  return (
    <Page
      title="Create new form"
      backAction={{ content: "All Forms", url: "/app" }}
      primaryAction={{
        content: "Publish",
        onAction: () => {
          handleCreate("publish-form");
        },
        loading: isFormPublished,
        disabled: loading.state,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: () => {
            navigate("/app");
          },
        },
        {
          content: "Save",
          onAction: () => handleCreate("create-form"),
          loading: !isFormPublished && !!loading.state,
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
                {...formValues}
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
                          setFields={setFields}
                          setLoadingCallback={setLoading}
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
            {...formValues}
            fields={fields}
          />
        </Grid.Cell>
      </Grid>
    </Page>
  );
}

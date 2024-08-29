import { json, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Badge,
  Box,
  Card,
  DataTable,
  EmptyState,
  Icon,
  InlineStack,
  Page
} from "@shopify/polaris";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { MyModal } from "../component/Modal";
import Contact from "../models/Contact.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);
  const res = await contact.getForms();

  return json({
    res,
  });
}

export async function action({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);
  const { id } = await request.json();
  
  const res = await contact.deleteForm(id);
  const isDeleted  = res?.status === 200;
  const message = res?.message;

  return json({
    isDeleted,
    message,
  });
}

export default function Index() {
  const { res } = useLoaderData();
  const [forms, setForms] = useState([]);
  const [formId, setFormId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (res.status === 200) {
      setForms(res.forms);
    }
  }, [res]);

  function handleDelete(id) {
    document.getElementById("my-modal").show();
    setFormId(id);
  }

  const rows = forms.map((form) => {
    const { id, name, shopify_url, onlinePublish } = form;
    return [
      id,
      name,
      shopify_url,
      "",
      <Badge tone={!onlinePublish ? 'critical' : 'success'}>
        {onlinePublish ? "Published" : "Not Published"}
      </Badge>,
      <InlineStack gap="300">
        <Box
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/app/edit-form/${id}`)}
        >
          <Icon source={EditIcon} />
        </Box>
        <Box style={{ cursor: "pointer" }} onClick={() => handleDelete(id)}>
          <Icon source={DeleteIcon} />
        </Box>
      </InlineStack>,
    ];
  });

  return (
    <Page
      primaryAction={{
        content: "Create New Form",
        onAction: () => navigate("/app/create-form"),
      }}
    >
      <Card>
        {res.status === 200 ? (
          <>
            <DataTable
              columnContentTypes={["text","text", "text", "text", "text", "text"]}
              headings={["Id", "Form Name", "Shop URL", "Shortcode", 'isPublished', "Actions"]}
              rows={rows}
              footerContent={<>🚀 That's all. Create amazing forms.</>}
            />
            <MyModal type="form" id={formId} />
          </>
        ) : (
          <EmptyState
            heading="No Form Is Created Yet."
            action={{ content: "Create New Form", url: "/app/create-form" }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>You haven't created any form yet.</p>
          </EmptyState>
        )}
      </Card>
    </Page>
  );
}

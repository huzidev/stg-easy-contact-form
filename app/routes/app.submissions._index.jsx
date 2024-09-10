import { json, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Box,
  Button,
  Card,
  DataTable,
  EmptyState,
  Icon,
  InlineStack,
  Page,
  Spinner,
  Text
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { MyModal } from "../component/Modal";
import Contact from "../models/Contact.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);
  const response = await contact.getPublishedForms();

  return json({
    ...response,
  });
}

export default function submissions() {
  const { status, forms } = useLoaderData();
  const [formId, setFormId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (status) {
      setLoading(false);
    }
  }, [status]);

  function handleDelete(id) {
    document.getElementById("my-modal").show();
    setFormId(id);
  }

  const rows = forms.map((form) => {
    const { id, name, shopify_url, submissions } = form;
    return [
      id,
      name,
      shopify_url,
      "",
      <Box>
        <Text alignment="center">{submissions.length ?? 0}</Text>
      </Box>,
      <InlineStack gap="300">
        <Box style={{ cursor: "pointer" }} onClick={() => handleDelete(id)}>
          <Icon source={DeleteIcon} />
        </Box>
      </InlineStack>,
      <Button onClick={() => navigate(`/app/submissions/${id}`)} variant="plain">
        View Submissions
      </Button>
    ];
  });

  return (
    <Page
      backAction={{ content: "Home", url: "/app" }}
      primaryAction={{
        content: "Create New Form",
        onAction: () => navigate("/app/create-form"),
      }}
    >
      <Card>
        {loading ? (
          <InlineStack align="center">
            <Spinner size="small" />
          </InlineStack>
        ) : status === 200 ? (
          <>
            <DataTable
              columnContentTypes={[
                "text",
                "text",
                "text",
                "text",
                "numeric",
                "text",
                "text",
              ]}
              headings={[
                "Id",
                "Form Name",
                "Shop URL",
                "Shortcode",
                "submissions",
                "Actions",
                "",
              ]}
              rows={rows}
            />
            <MyModal type="form" id={formId} />
          </>
        ) : (
          <EmptyState
            heading="No Form Is Published Yet."
            action={{ content: "Create New Form", url: "/app/create-form" }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>You haven't published any form yet.</p>
          </EmptyState>
        )}
      </Card>
    </Page>
  );
}

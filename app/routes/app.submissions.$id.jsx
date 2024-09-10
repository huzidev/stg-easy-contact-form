import { json, useLoaderData } from "@remix-run/react";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  InlineStack,
  Page,
  Spinner
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import Contact from "../models/Contact.server";
import { authenticate } from "../shopify.server";

const booleanTypes = ['radio', 'checkbox'];

export async function loader({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const contact = new Contact(session.shop, admin.graphql);
  const { id } = params;

  const response = await contact.getForm(id);

  return json({
    ...response,
  });
}

export default function submissions() {
  const { status, form } = useLoaderData();
  const [columnHeadings, setColumnHeadings] = useState([]);
  const [columnTypes, setColumnTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status) {
      setLoading(false);

      // setting the headings for DataTable
      const headings = form.fields.map((field) => field.fieldLabel);
      // setting the types for DataTable
      const types = form.fields.map((field) =>
        field.fieldType === "number" ? "numeric" : "text",
      );
      setColumnHeadings(headings);
      setColumnTypes(types);
    }
  }, [status]);

  const rows =
    form.submissions?.map((submission) => {
      const parsedValues = JSON.parse(submission.values);

      return form.fields.map((field) => {
        const matchedValue = parsedValues.find(
          (value) => value.column_id === field.id,
        );

        if (!matchedValue) return "-";

        if (booleanTypes.includes(field.fieldType) && matchedValue.value === "on") {
          return (
            <Badge tone="success">True</Badge>
          );
        }

        return matchedValue.value;
      });
    }) ?? [];

  return (
    <Page
      backAction={{ content: "Submissions", url: "/app/submissions" }}
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
        ) : !!form.submissions.length ? (
          <>
            <DataTable
              columnContentTypes={columnTypes}
              headings={columnHeadings}
              rows={rows}
            />
          </>
        ) : (
          <EmptyState
            heading="No submissions found"
            action={{ content: "Create New Form", url: "/app/create-form" }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>No submissions are linked with this form</p>
          </EmptyState>
        )}
      </Card>
    </Page>
  );
}

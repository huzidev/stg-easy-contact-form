import { useActionData, useSubmit } from "@remix-run/react";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { InlineStack, Spinner, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";

export function MyModal({ type, id, deleteFieldCallback, setShowModalCallback }) {
  const shopify = useAppBridge();
  const actionData = useActionData();
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);
  const isFormPage = type === "form";
  const label = isFormPage ? "Form" : "Field";

  function handleDelete() {
    setLoading(true);
    if (isFormPage) {
      submit(
        { id, action: "delete" },
        { method: "delete", encType: "application/json", replace: true },
      );
    } else {
      deleteFieldCallback();
      shopify.modal.hide("my-modal");
      setShowModalCallback(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (actionData?.isDeleted) {
      shopify.modal.hide("my-modal");
      setLoading(false);
      shopify.toast.show(actionData?.message)
    }
  }, [actionData]);

  return (
    <>
      <Modal id="my-modal">
        <div style={{ margin: "15px" }}>
          {loading ? (
            <InlineStack gap="100">
              Please wait...
              <Spinner size="small" />
            </InlineStack>
          ) : (
            <Text as="p">
              Are you sure you want to delete this {label}?
            </Text>
          )}
        </div>
        <TitleBar title={`Delete ${label}`}>
          <button onClick={handleDelete} variant="primary">
            Delete
          </button>
          <button onClick={() => shopify.modal.hide("my-modal")}>Cancel</button>
        </TitleBar>
      </Modal>
    </>
  );
}

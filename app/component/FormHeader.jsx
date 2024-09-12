import {
  BlockStack,
  Box,
  Card,
  Checkbox,
  TextField
} from "@shopify/polaris";

export default function FormHeader({
  heading,
  description,
  merchantEmail,
  showTitle,
  handleChangeCallback,
}) {
  return (
    <Card>
      <BlockStack gap="200">
        <Box>
          <TextField
            label="Title"
            value={heading}
            onChange={(value) => handleChangeCallback("heading", value)}
            autoComplete="off"
          />
        </Box>
        <Box>
          <TextField
            label="Email"
            type="email"
            placeholder="Receive Submissions Email"
            value={merchantEmail}
            onChange={(value) => handleChangeCallback("merchantEmail", value)}
            autoComplete="off"
          />
        </Box>
        <Box>
          <TextField
            label="Description"
            name="description"
            placeholder="Enter Form Description"
            multiline={4}
            value={description}
            onChange={(value) => handleChangeCallback("description", value)}
          />
        </Box>
        <Box>
          <Checkbox
            label={"Show Title"}
            checked={showTitle}
            onChange={() => handleChangeCallback("showTitle", !showTitle)}
          />
        </Box>
      </BlockStack>
    </Card>
  );
}

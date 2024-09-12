import {
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  FormLayout,
  RadioButton,
  Select,
  Text,
  TextField
} from "@shopify/polaris";
import React, { useCallback, useState } from "react";
import { TextTypes } from "../utils/data";

export default function Preview({ heading, showTitle, description, fields }) {
  const [fieldValues, setFieldValues] = useState({});
  const [option, setOption] = useState("");

  const getValue = useCallback(
    (fieldName) => {
      return fieldValues[fieldName];
    },
    [fieldValues],
  );

  const setValue = (fieldName, value) => {
    setFieldValues((prev) => {
      return {
        ...prev,
        [fieldName]: value,
      };
    });
  };

  return (
    <Box maxWidth="600px">
      <Card sectioned>
        <BlockStack gap="500">
          <Text variant="heading2xl" as="h2">
            {showTitle ? heading : ""}
          </Text>
          <Text variant="heading" as="p">
            {description}
          </Text>
          <FormLayout>
            {fields.map((field, i) => {
              const {
                fieldLabel,
                fieldName,
                placeholder,
                defaultValue,
                fieldType,
                isRequired,
                selectOptions,
                min,
                max,
                totalLines,
              } = field;
              const value = getValue(fieldName);
              const textFieldLabel = isRequired
                ? `${fieldLabel} *`
                : fieldLabel;
              const isTextType = TextTypes.includes(fieldType);
              return isTextType ? (
                <TextField
                  label={textFieldLabel}
                  key={i}
                  placeholder={placeholder}
                  value={!!defaultValue ? defaultValue : value}
                  multiline={
                    fieldType === "textarea" ? parseInt(totalLines) : 1
                  }
                  onChange={(value) => setValue(fieldName, value)}
                  required={isRequired}
                />
              ) : fieldType === "select" ? (
                <Select
                  key={i}
                  value={option}
                  label={textFieldLabel}
                  options={selectOptions}
                  onChange={(value) => setOption(value)}
                />
              ) : fieldType === "radio" ? (
                <RadioButton
                  label={textFieldLabel}
                  helpText={placeholder}
                  onChange={(value) => setValue(fieldName, value)}
                  required={isRequired}
                />
              ) : fieldType === "checkbox" ? (
                <Checkbox
                  label={textFieldLabel}
                  onChange={(value) => setValue(fieldName, value)}
                  required={isRequired}
                />
              ) : (
                <TextField
                  label={textFieldLabel}
                  key={i}
                  placeholder={placeholder}
                  value={value}
                  min={min}
                  max={max}
                  onChange={(value) => setValue(fieldName, value)}
                  required={isRequired}
                />
              );
            })}
            <Button onClick={() => {}} primary>
              Submit
            </Button>
          </FormLayout>
        </BlockStack>
      </Card>
    </Box>
  );
}

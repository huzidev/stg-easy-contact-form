import { useActionData, useLocation } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  Icon,
  InlineStack,
  List,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  EditIcon,
} from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { FieldType } from "../utils/data";
import { MyModal } from "./Modal";

const TypeOptions = Object.keys(FieldType).map((key) => ({
  label: key,
  value: FieldType[key],
}));

export default function SidebarField({
  id,
  index,
  title,
  fieldLabel,
  placeholder,
  fieldType,
  isRequired,
  defaultValue,
  options,
  min,
  max,
  totalLines,
  setFieldsCallback,
  selectOptions,
  setLoadingCallback,
  setDeleteFieldsId,
}) {
  const actionData = useActionData();
  const [isOpen, setOpen] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [isEditOption, setEditOption] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const isEditPage = location.pathname.includes("/app/edit-form");

  // When User clicks on save button
  useEffect(() => {
    if (actionData?.isSuccess) {
      setOpen(false);
      setLoadingCallback({
        type: "",
        state: false,
      });
    }
    shopify.toast.show(actionData?.message);
  }, [actionData]);

  // delete the selected filed
  const deleteField = useCallback(() => {
    setFieldsCallback((prevFields) => {
      const fields = [...prevFields];
      fields.splice(index, 1);
      if (isEditPage) {
        setDeleteFieldsId((prevId) => [...prevId, id]);
      }
      setOpen(false);
      return fields;
    });
  }, [setFieldsCallback, index, id]);

  // delete the selectedOptions fields
  const handleDeleteOption = useCallback(
    (optionIndex) => {
      setFieldsCallback((prevFields) => {
        
        const fields = [...prevFields];
        const field = fields[index];
        console.log("SW field", field);
        field.selectOptions = field.selectOptions.filter(
          (_, i) => i !== optionIndex,
        );
        return fields;
      });
    },
    [setFieldsCallback, index],
  );

  const handleInputChange = useCallback(
    (name, newValue) => {
      setFieldsCallback((prevFields) => {
        const fields = [...prevFields];
        const field = fields[index];
        if (name === "selectOptions") {
          field.selectOptions = [
            ...(field.selectOptions ?? []),
            {
              label: newValue,
              value: newValue,
            },
          ];
          setNewOption("");
          if (isEditOption) {
            setEditOption(false);
          }
        } else {
          field[name] = newValue;
        }
        fields[index] = field;
        return fields;
      });
    },
    [setFieldsCallback, index, newOption],
  );

  function handleEditOption(value, i) {
    handleDeleteOption(i);
    setNewOption(value);
    setEditOption(true);
  }

  useEffect(() => {
    if (options?.length) {
      setFieldsCallback((prevFields) => {
        const fields = [...prevFields];
        const field = fields[index];
        field.selectOptions = options.map((option) => ({
          label: option.label,
          value: option.value,
        }));
        return fields;
      });
    }
  }, [options, setFieldsCallback, index]);

  async function handleShowModal() {
    const promise = new Promise((resolve, reject) => {
      setShowModal(true);
      resolve();
    });
    promise.then(() => {
      document.getElementById("my-modal").show();
    });
  }

  return (
    <Box width="100%" style={{ cursor: "pointer" }}>
      <BlockStack gap="500">
        <Box
          onClick={() => {
            setOpen(!isOpen);
          }}
        >
          <InlineStack as="div" align="space-between">
            <Text>{title}</Text>
            <Box>
              <Icon source={isOpen ? ChevronUpIcon : ChevronDownIcon} />
            </Box>
          </InlineStack>
        </Box>
        {isOpen && (
          <BlockStack gap="200">
            <Box>
              <Select
                label="Type"
                options={TypeOptions}
                onChange={(selected) =>
                  handleInputChange("fieldType", selected)
                }
                value={fieldType}
              />
            </Box>
            <Box>
              <TextField
                label="Field Label"
                value={fieldLabel}
                onChange={(value) => {
                  handleInputChange("fieldLabel", value);
                  handleInputChange("fieldName", value);
                }}
              />
            </Box>
            <Box>
              {![
                FieldType.CHECKBOX,
                FieldType.RADIO,
                FieldType.SELECT,
              ].includes(fieldType) && (
                <TextField
                  label="Placeholder"
                  value={placeholder}
                  onChange={(value) => handleInputChange("placeholder", value)}
                />
              )}
            </Box>
            {fieldType === FieldType.SELECT && (
              <Box>
                <BlockStack gap="200">
                  <TextField
                    label="New Option"
                    value={newOption}
                    onChange={(value) => setNewOption(value)}
                  />
                  <Button
                    disabled={newOption === "" ? true : false}
                    onClick={() =>
                      handleInputChange("selectOptions", newOption)
                    }
                  >
                    {(isEditOption ? "Update " : "Add ") + "Option"}
                  </Button>
                  <List type="bullet">
                    {selectOptions &&
                      selectOptions.map((option, i) => (
                        <InlineStack align="space-between">
                          <List.Item key={i}>{option?.label}</List.Item>
                          <InlineStack gap="100">
                            <Box
                              onClick={() => handleEditOption(option?.value, i)}
                            >
                              <Icon source={EditIcon} />
                            </Box>
                            <Box onClick={() => handleDeleteOption(i)}>
                              <Icon source={DeleteIcon} />
                            </Box>
                          </InlineStack>
                        </InlineStack>
                      ))}
                  </List>
                </BlockStack>
              </Box>
            )}
            <Box>
              {/* Hide Default Value Label if checkbox or radio button */}
              {![
                FieldType.CHECKBOX,
                FieldType.RADIO,
                FieldType.SELECT,
              ].includes(fieldType) && (
                <TextField
                  label="Default Value"
                  value={defaultValue}
                  onChange={(value) => handleInputChange("defaultValue", value)}
                />
              )}
              {fieldType === FieldType.NUMBER && (
                <>
                  <TextField
                    label="Min Value"
                    type="number"
                    value={min}
                    min={0}
                    onChange={(value) => handleInputChange("min", value)}
                  />
                  <TextField
                    label="Max Value"
                    type="number"
                    value={max}
                    min={1}
                    onChange={(value) => handleInputChange("max", value)}
                  />
                </>
              )}
            </Box>
            <Box>
              {fieldType === FieldType.TEXTAREA && (
                <TextField
                  label="Lines"
                  type="number"
                  min={1}
                  value={totalLines}
                  onChange={(value) => handleInputChange("totalLines", value)}
                />
              )}
              <Checkbox
                label="Is Required"
                checked={isRequired}
                onChange={(value) => handleInputChange("isRequired", value)}
              />
            </Box>
            <Box>
              <Button
                onClick={handleShowModal}
                tone="critical"
                icon={DeleteIcon}
                variant="plain"
              >
                Delete
              </Button>
            </Box>
          </BlockStack>
        )}
        {showModal && (
          <MyModal
            type="field"
            id={id}
            setShowModalCallback={setShowModal}
            deleteFieldCallback={deleteField}
          />
        )}
      </BlockStack>
    </Box>
  );
}

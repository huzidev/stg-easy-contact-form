import prisma from "../db.server";

export default class Contact {
  constructor(shop, graphql) {
    this.shopUrl = shop;
    this.graphql = graphql;
  }

  async generateField(values, formId) {
    for (let value of values) {
      const {
        fieldName,
        fieldLabel,
        placeholder,
        defaultValue,
        fieldType,
        totalLines,
        min,
        max,
        isRequired,
        selectOptions,
      } = value;
      const field = await prisma.field.create({
        data: {
          shopify_url: this.shopUrl,
          fieldName,
          fieldLabel,
          placeholder,
          defaultValue,
          fieldType,
          totalLines,
          min: fieldType === "number" ? parseInt(min) : null,
          max: fieldType === "number" ? parseInt(max) : null,
          isRequired,
          options:
            fieldType === "select"
              ? {
                  create: selectOptions.map((option) => ({
                    label: option,
                  })),
                }
              : undefined,
          formId,
        },
      });
      return field;
    }
  }

  async createForm(formValues, fieldsValues) {
    try {
      const { name, heading, description } = formValues;
      let form = await prisma.form.create({
        data: {
          shopify_url: this.shopUrl,
          name,
          heading,
          description,
        },
      });
      const { id } = form;
      if (!!fieldsValues.length) {
        let field = await this.generateField(fieldsValues, id);
        if (field) {
          return {
            status: 200,
            field,
            form,
          };
        }
      }
      return {
        status: 200,
        form,
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async addField(values, formId) {
    try {
      let field = await this.generateField(values, formId);
      if (field) {
        return {
          status: 200,
          field,
        };
      }
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async editFields(id, values) {
    try {
      const editedField = await prisma.field.update({
        where: {
          id,
        },
        data: {
          ...values,
        },
      });
      return editedField;
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async deleteField(id) {
    try {
      const res = await prisma.field.delete({
        where: {
          id,
        },
      });
      return res;
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async getFields() {
    try {
      const formFields = await prisma.field.findMany({
        where: {
          shopify_url: this.shopUrl,
        },
        include: {
          options: true,
        },
      });
      return {
        status: !!formFields.length ? 200 : 404,
        formFields,
      };
    } catch (error) {
      console.error("Error : ", error);
      throw error;
    }
  }

  async getForms() {
    try {
      const forms = await prisma.form.findMany({
        where: {
          shopify_url: this.shopUrl,
        },
      });
      return {
        status: !!forms.length ? 200 : 404,
        forms,
      };
    } catch (error) {
      console.error("Error : ", error);
      throw error;
    }
  }

  async getForm() {
    try {
      const form = await prisma.form.findFirst({
        where: {
          shopify_url: this.shopUrl,
        },
      });
      console.log("SW form", form);
      return {
        formStatus: !!form ? 200 : 404,
        form,
      };
    } catch (error) {
      console.error("Error : ", error);
      throw error;
    }
  }
}

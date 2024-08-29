import prisma from "../db.server";

export default class Contact {
  constructor(shop, graphql) {
    this.shopUrl = shop;
    this.graphql = graphql;
  }

  async generateField(values, formId) {
    let fields = [];
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
      let res = await prisma.field.create({
        data: {
          shopify_url: this.shopUrl,
          fieldName,
          fieldLabel,
          placeholder,
          defaultValue,
          fieldType,
          totalLines: parseInt(totalLines),
          min: fieldType === "number" ? parseInt(min) : null,
          max: fieldType === "number" ? parseInt(max) : null,
          isRequired,
          options:
            fieldType === "select"
              ? {
                  create: selectOptions.map((option) => ({
                    label: option.label,
                    value: option.label,
                  })),
                }
              : undefined,
          formId: parseInt(formId),
        },
      });
      fields.push(res);
    }
    return fields;
  }

  async createForm(onlinePublish, formValues, fieldsValues) {
    try {
      const { heading, description, showTitle } = formValues;
      
      let form = await prisma.form.create({
        data: {
          shopify_url: this.shopUrl,
          name: heading,
          heading,
          description,
          showTitle,
          onlinePublish,
        },
      });
      const { id } = form;
      const fields = await this.generateField(fieldsValues, id);
      return {
        status: 200,
        fields,
        form,
        message: 'Form Created Successfully!'
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async addField(values, formId) {
    try {
      const fields = await this.generateField(values, formId);
      return {
        status: 200,
        fields,
        message: 'Form Updated Successfully'
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async publishForm(value, id) {
    try {
      await prisma.form.update({
        where: {
          id: parseInt(id),
        },
        data: {
          onlinePublish: value,
        },
        include: {
          fields: true,
        },
      });

      let type = value ? "Published" : "Unpublished";
      return {
        status: 200,
        message: `Form ${type} Successfully`,
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async editForm(values, id) {
    try {
      const { heading, description, showTitle } = values;
      await prisma.form.update({
        where: {
          id: parseInt(id),
        },
        data: {
          heading,
          description,
          showTitle,
        },
      });
      return {
        status: 200,
        message: "Form Saved Successfully",
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async editFields(values) {
    try {
      for (let value of values) {
        const { id, formId, fieldType, selectOptions, ...updateData } = value;
        await prisma.field.update({
          where: {
            id,
            formId,
          },
          data: {
            ...updateData,
            options:
              fieldType === "select"
                ? {
                    create: selectOptions.map((option) => ({
                      label: option.label,
                      value: option.label,
                    })),
                  }
                : undefined,
          },
        });
      }
      return {
        status: 200,
        message: "Form Saved Successfully",
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async getFields(formId) {
    try {
      const formFields = await prisma.field.findMany({
        where: {
          shopify_url: this.shopUrl,
          formId: parseInt(formId),
        },
        include: {
          options: true,
        },
      });
      return {
        fieldStatus: !!formFields.length ? 200 : 404,
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
        include: {
          fields: true,
        },
        orderBy: {
          id: "desc"
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

  async getForm(id) {
    try {
      const form = await prisma.form.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return {
        formStatus: !!form ? 200 : 404,
        form,
      };
    } catch (error) {
      console.error("Error : ", error);
      throw error;
    }
  }

  async deleteFields(ids) {
    try {
      await prisma.field.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return {
        status: 200,
        message: "Fields Deleted Successfully",
      };
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async deleteForm(id) {
    try {
      await prisma.form.delete({
        where: {
          id: parseInt(id),
        },
      });
      return {
        status: 200,
        message: "Form Deleted Successfully",
      };
    } catch (error) {
      console.error("Error : ", error);
      throw error;
    }
  }
}

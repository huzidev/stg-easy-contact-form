import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  console.log("SW is action method called?");
  const formData = await request.formData();
  const formId = formData.get("formId");

  const form = await prisma.form.findFirst({
    where: {
      id: parseInt(formId),
    },
    include: {
      fields: {
        include: {
          options: true,
        },
      },
    },
  });

  const formDataObject = Object.fromEntries(formData.entries());

  const values = form.fields.reduce((acc, field) => {
    const value = formDataObject[field.fieldName];

    if (value) {
      acc.push({
        column_id: field.id,
        value: value,
      });
    }

    return acc;
  }, []);

  await prisma.submission.create({
    data: {
      formId: parseInt(formId),
      values: JSON.stringify(values),
    },
  });

  return json({
    status: 200,
  });
}

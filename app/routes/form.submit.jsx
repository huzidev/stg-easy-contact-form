import { json } from "@remix-run/node";
import formData from "form-data";
import Mailgun from "mailgun.js";
import prisma from "../db.server";

export async function action({ request }) {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: "api", key: mailgunApiKey });
  const formDataFromRequest = await request.formData();
  const formId = formDataFromRequest.get("formId");

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

  const formDataObject = Object.fromEntries(formDataFromRequest.entries());

  const formattedValues = form.fields
    .map((field) => {
      const value = formDataObject[field.fieldName];
      return value ? `${field.fieldLabel}: ${value}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const emailData = {
    from: "Contact Form Shopify <mailgun@sandbox2229350bb7504c478d3e5d412435a3c8.mailgun.org>",
    to: [form.merchantEmail],
    subject: `New Form Submission: ${form.name}`,
    template: "Submission template",

    "h:X-Mailgun-Variables": {
      form_title: form.heading,
      content: formattedValues
        .split("\n")
        .map(
          (line) =>
            `<p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${line}</p>`,
        )
        .join(""),
    },
  };

  try {
    const response = await mg.messages.create(mailgunDomain, emailData);
    console.log("SW mailgun response", response);

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

    const submissionRes = await prisma.submission.create({
      data: {
        formId: parseInt(formId),
        values: JSON.stringify(values),
      },
    });

    console.log("SW submissionRes", submissionRes);

    
  } catch (error) {
    console.error("Error sending email", error);
  }
  return json({
    status: 200,
    message: "Form submission successful and email sent.",
  });
}

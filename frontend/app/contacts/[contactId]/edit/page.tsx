import { Topbar } from "../../../../components/layout/topbar";
import { ContactForm } from "../../../../components/contacts/contact-form";

type EditContactPageProps = {
  params: Promise<{
    contactId: string;
  }>;
};

const EditContactPage = async ({ params }: EditContactPageProps) => {
  const { contactId } = await params;

  return (
    <>
      <Topbar
        title="Edit contact"
        subtitle="Update company details, tags, and duplicate-sensitive fields safely."
      />
      <ContactForm mode="edit" contactId={contactId} />
    </>
  );
};

export default EditContactPage;

import { Topbar } from "../../../components/layout/topbar";
import { ContactForm } from "../../../components/contacts/contact-form";

const NewContactPage = () => {
  return (
    <>
      <Topbar
        title="Add contact"
        subtitle="Create a new CRM contact with duplicate-sensitive identity details."
      />
      <ContactForm mode="create" />
    </>
  );
};

export default NewContactPage;


import { Topbar } from "../../components/layout/topbar";
import { ContactList } from "../../components/contacts/contact-list";

const ContactsPage = () => {
  return (
    <>
      <Topbar
        title="Contacts"
        subtitle="Manage the CRM directory with search, filters, duplicate-aware records, and timeline references."
      />
      <ContactList />
    </>
  );
};

export default ContactsPage;

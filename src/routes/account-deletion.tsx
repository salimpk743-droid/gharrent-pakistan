import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";

export const Route = createFileRoute("/account-deletion")({
  head: () => ({
    meta: [
      { title: "Account & Data Deletion — GharRent Pakistan" },
      {
        name: "description",
        content: "How GharRent Pakistan users can request deletion of their account and associated personal data.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage eyebrow="ACCOUNT & DATA" title="Account & Data Deletion">
      <p>
        GharRent Pakistan provides a simple way for users to request deletion of their account and associated
        personal data.
      </p>

      <h2>How to request deletion</h2>
      <ol>
        <li>
          Open the <Link to="/contact" className="underline">Contact GharRent</Link> page.
        </li>
        <li>Enter the email address associated with your GharRent account.</li>
        <li>For the subject, enter <strong>Account deletion request</strong>.</li>
        <li>Ask us to delete your account and associated personal data, and include any relevant details that help us identify your account.</li>
        <li>Submit the request using the Send message button.</li>
      </ol>

      <h2>What happens after a request</h2>
      <p>
        We will review the request, verify that it relates to the account owner, and process deletion of personal
        data that we no longer need to retain. Public listings associated with the account will be removed from
        public display. Some information may be retained where reasonably necessary for security, fraud prevention,
        dispute handling, or legal obligations.
      </p>

      <h2>Need help?</h2>
      <p>
        If you cannot access your account, you can still use the Contact page to submit a deletion request. Please
        provide enough information for us to identify the account without sending passwords or other sensitive
        credentials.
      </p>
    </LegalPage>
  );
}

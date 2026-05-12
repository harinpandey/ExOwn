export const metadata = { title: "Terms of Service | ExOwn", description: "ExOwn Terms of Service." };

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-10 text-sm">Last updated: May 2026</p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing or using ExOwn, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform."
          },
          {
            title: "2. Eligibility",
            body: "ExOwn is intended for use by students and faculty of registered universities. You must be at least 18 years old or have parental consent to use this service."
          },
          {
            title: "3. User Accounts",
            body: "You are responsible for maintaining the security of your account. You must provide accurate information and must not impersonate another person. You are responsible for all activity that occurs under your account."
          },
          {
            title: "4. Listings and Transactions",
            body: "ExOwn is a platform that connects buyers and sellers. We do not participate in the actual transaction between buyers and sellers. You are solely responsible for the listings you post and the transactions you enter into."
          },
          {
            title: "5. Prohibited Content",
            body: "You may not list or sell: illegal items, counterfeit goods, weapons, drugs, or any item that violates applicable law or university policy. We reserve the right to remove any listing at our discretion."
          },
          {
            title: "6. No Warranty",
            body: "ExOwn is provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any listing or user information on the platform."
          },
          {
            title: "7. Limitation of Liability",
            body: "ExOwn shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including any losses from transactions with other users."
          },
          {
            title: "8. Changes to Terms",
            body: "We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms."
          },
          {
            title: "9. Contact",
            body: "For questions about these terms, please contact us through the platform."
          },
        ].map(({ title, body }) => (
          <section key={title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-3">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

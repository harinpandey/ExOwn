export const metadata = { title: "Privacy Policy | ExOwn", description: "ExOwn Privacy Policy." };

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-10 text-sm">Last updated: May 2026</p>

      <div className="space-y-6">
        {[
          {
            title: "Information We Collect",
            body: "When you sign in with Google, we collect your name, email address, and profile photo from your Google account. We also collect information about listings you create, messages you send, and your interactions with the platform."
          },
          {
            title: "How We Use Your Information",
            body: "We use your information to: provide and improve the platform, display your profile on listings and messages, verify that you are a real student, and communicate important updates about your account or listings."
          },
          {
            title: "What We Share",
            body: "Your display name and profile photo are visible to other users when you post a listing or send a message. Your email address is never displayed publicly. We do not sell your personal data to third parties."
          },
          {
            title: "Data Storage",
            body: "Your data is stored securely in our database hosted on Neon (PostgreSQL). Images you upload are stored on Cloudinary. Authentication is handled by Firebase."
          },
          {
            title: "Cookies",
            body: "We use cookies and local storage to maintain your login session and preferences. You can clear these at any time through your browser settings."
          },
          {
            title: "Data Retention",
            body: "We retain your account data as long as your account is active. You may request deletion of your account and associated data by contacting us through the platform."
          },
          {
            title: "Your Rights",
            body: "You have the right to access, correct, or delete your personal data. You can update your profile information at any time from your account settings."
          },
          {
            title: "Changes to This Policy",
            body: "We may update this policy from time to time. We will notify you of significant changes by posting a notice on the platform."
          },
          {
            title: "Contact Us",
            body: "If you have any questions about this privacy policy or how we handle your data, please reach out through the platform."
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

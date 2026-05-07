import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

const Privacy = () => {
  const lastUpdated = "January 1, 2026";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, phone number, and payment details. We also collect usage data such as search queries, booking history, and device information.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to process bookings, send confirmations, improve our services, and communicate with you about your account. We do not sell your personal data to third parties.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption. Passwords are hashed using bcrypt. Payment information is processed through Razorpay and is never stored on our servers.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Cookies</h2>
            <p>We use cookies to maintain your session and improve your experience. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain features of the platform.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Third-Party Services</h2>
            <p>We use third-party services including Google OAuth for authentication, Razorpay for payments, and Cloudinary for image storage. Each service has its own privacy policy.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal data at any time through your profile settings. You may also request a complete data export or account deletion by contacting us.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Data Retention</h2>
            <p>We retain your booking history and account information as long as your account is active. Inactive accounts may be archived after 2 years. Deleted accounts and associated data are permanently removed within 30 days.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Children's Privacy</h2>
            <p>Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such data, please contact us.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
            <p>We may update this privacy policy periodically. Material changes will be communicated via email or a prominent notice on our platform.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:createwitirfan@atomicmail.io" className="text-primary-600 hover:underline">createwitirfan@atomicmail.io</a></p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

const Terms = () => {
  const lastUpdated = "January 1, 2026";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using StayNest, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Use of the Platform</h2>
            <p>StayNest provides a hotel booking platform. You agree to use the service only for lawful purposes and in accordance with these terms. You must be at least 18 years old to make a booking.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Bookings and Payments</h2>
            <p>All bookings are subject to availability. Prices are displayed in Indian Rupees (INR) and include applicable taxes. Payment is processed securely through Razorpay. Once a booking is confirmed, cancellation is subject to the hotel's cancellation policy.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cancellations and Refunds</h2>
            <p>Cancellation policies vary by hotel. Refunds, when applicable, are processed within 7-10 business days to the original payment method. StayNest reserves the right to charge a processing fee for cancellations made outside the free cancellation window.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
            <p>StayNest acts as an intermediary between guests and hotel owners. We are not liable for any disputes between guests and hotels, including but not limited to service quality, overbooking, or property conditions.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Reviews and Content</h2>
            <p>User reviews must be honest and based on actual experiences. We reserve the right to remove reviews that contain offensive language, personal attacks, or false information.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. Users will be notified of significant changes via email.</p>
          </section>
          <Separator />
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:createwitirfan@atomicmail.io" className="text-primary-600 hover:underline">createwitirfan@atomicmail.io</a></p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;

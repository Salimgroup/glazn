import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: October 3, 2025</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Glazn ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website glazn.com (the "Platform") and use our services.
          </p>
          <p>
            Please read this privacy policy carefully. By accessing or using our Platform, you acknowledge that you have read, understood, and agree to be bound by all the terms of this privacy policy. If you do not agree with this privacy policy, please do not access or use the Platform.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide to Us</h3>
          <p><strong>Account Information:</strong> When you create an account, we collect:</p>
          <ul>
            <li>Username and display name</li>
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Date of birth</li>
            <li>Phone number (if provided)</li>
            <li>Profile information and bio</li>
          </ul>

          <p><strong>Payment Information:</strong> For transactions, we collect:</p>
          <ul>
            <li>Payment card details (processed by third-party payment processors)</li>
            <li>Billing address</li>
            <li>Transaction history</li>
            <li>Bank account information (for payouts, if applicable)</li>
          </ul>

          <p><strong>Identity and Age Verification:</strong> We collect:</p>
          <ul>
            <li>Government-issued identification documents (required)</li>
            <li>Selfie photographs for verification</li>
            <li>Date of birth verification</li>
            <li>Biometric data for age verification purposes</li>
            <li>Social security number or tax identification (where required for creators)</li>
          </ul>

          <p>
            All users must verify they are at least 18 years of age to access the Platform. Age verification data is processed securely and stored encrypted.
          </p>

          <p><strong>Content You Create:</strong> Including:</p>
          <ul>
            <li>Posts, comments, and messages</li>
            <li>Photos, videos, and other media files</li>
            <li>Live stream data</li>
            <li>Any other content you upload to the Platform</li>
          </ul>

          <p><strong>Communications:</strong> When you contact us:</p>
          <ul>
            <li>Support inquiries and correspondence</li>
            <li>Feedback and survey responses</li>
            <li>Email communications</li>
          </ul>

          <h3>2.2 Information We Collect Automatically</h3>
          <p><strong>Device and Usage Information:</strong></p>
          <ul>
            <li>IP address and device identifiers</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Device type (mobile, desktop, tablet)</li>
            <li>Pages viewed and features accessed</li>
            <li>Time and date of visits</li>
            <li>Referring website addresses</li>
            <li>Clickstream data</li>
          </ul>

          <p><strong>Location Information:</strong></p>
          <ul>
            <li>General location based on IP address</li>
            <li>Precise geolocation (if you grant permission)</li>
          </ul>

          <p><strong>Cookies and Tracking Technologies:</strong></p>
          <ul>
            <li>Session cookies</li>
            <li>Persistent cookies</li>
            <li>Web beacons and pixels</li>
            <li>Local storage data</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <p>We may receive information about you from:</p>
          <ul>
            <li>Social media platforms (if you connect your accounts)</li>
            <li>Payment processors</li>
            <li>Identity verification services</li>
            <li>Analytics providers</li>
            <li>Marketing partners</li>
            <li>Other users (when they interact with your content)</li>
          </ul>

          <h2>3. How We Use Your Information</h2>

          <h3>3.1 Providing and Improving Our Services</h3>
          <ul>
            <li>Creating and managing your account</li>
            <li>Processing transactions and payments</li>
            <li>Delivering content and communications</li>
            <li>Providing customer support</li>
            <li>Improving Platform functionality and user experience</li>
            <li>Developing new features and services</li>
            <li>Personalizing your experience</li>
          </ul>

          <h3>3.2 Safety and Security</h3>
          <ul>
            <li>Verifying your identity and age (mandatory for all users)</li>
            <li>Preventing fraud and unauthorized access</li>
            <li>Detecting and preventing violations of our Terms of Service</li>
            <li>Protecting against malicious or illegal activity</li>
            <li>Content moderation and safety monitoring</li>
            <li>Detecting and removing prohibited content</li>
            <li>Preventing access by minors</li>
            <li>Identifying and reporting illegal activity to authorities</li>
            <li>Enforcing our legal rights</li>
            <li>Complying with legal obligations including 18 U.S.C. § 2257 requirements</li>
          </ul>

          <h3>3.3 Communications</h3>
          <ul>
            <li>Sending transactional emails and notifications</li>
            <li>Providing customer service responses</li>
            <li>Sending marketing communications (with your consent)</li>
            <li>Conducting surveys and research</li>
            <li>Sending administrative messages</li>
          </ul>

          <h3>3.4 Analytics and Research</h3>
          <ul>
            <li>Understanding how users interact with the Platform</li>
            <li>Analyzing trends and usage patterns</li>
            <li>Conducting market research</li>
            <li>Generating aggregated, anonymized statistics</li>
          </ul>

          <h3>3.5 Legal Compliance</h3>
          <ul>
            <li>Complying with applicable laws and regulations</li>
            <li>Responding to legal requests and court orders</li>
            <li>Protecting our legal rights and interests</li>
            <li>Enforcing our agreements and policies</li>
          </ul>

          <h2>4. How We Share Your Information</h2>

          <h3>4.1 With Other Users</h3>
          <ul>
            <li>Your public profile information</li>
            <li>Content you choose to share publicly</li>
            <li>Your interactions with other users' content</li>
          </ul>

          <h3>4.2 With Service Providers</h3>
          <p>We share information with third-party service providers who perform services on our behalf:</p>
          <ul>
            <li>Payment processors</li>
            <li>Cloud storage providers</li>
            <li>Email service providers</li>
            <li>Analytics providers</li>
            <li>Customer support platforms</li>
            <li>Age and identity verification services</li>
            <li>Content moderation services</li>
            <li>Content delivery networks</li>
          </ul>

          <h3>4.3 For Legal Reasons</h3>
          <p>We may disclose your information:</p>
          <ul>
            <li>To comply with legal obligations</li>
            <li>In response to lawful requests from law enforcement</li>
            <li>To protect our rights, property, or safety</li>
            <li>To prevent fraud or illegal activity</li>
            <li>In connection with legal proceedings</li>
          </ul>

          <h3>4.4 Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, asset sale, or bankruptcy, your information may be transferred as part of that transaction.
          </p>

          <h3>4.5 With Your Consent</h3>
          <p>We may share your information for other purposes with your explicit consent.</p>

          <h2>5. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We take appropriate safeguards to ensure your information receives adequate protection, including:
          </p>
          <ul>
            <li>Standard contractual clauses</li>
            <li>Privacy Shield certification (where applicable)</li>
            <li>Other legally approved transfer mechanisms</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>We retain your information for as long as necessary to:</p>
          <ul>
            <li>Provide our services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p>
            When you delete your account, we will delete or anonymize your information within 90 days, except where we need to retain certain information for legal or legitimate business purposes.
          </p>
          <p>
            Backup copies may persist for an additional period but will be deleted in accordance with our backup retention schedule.
          </p>

          <h2>7. Your Rights and Choices</h2>
          <p>Depending on your location, you may have the following rights:</p>

          <h3>7.1 Access and Portability</h3>
          <ul>
            <li>Request access to your personal data</li>
            <li>Receive a copy of your data in a portable format</li>
          </ul>

          <h3>7.2 Correction and Deletion</h3>
          <ul>
            <li>Update or correct inaccurate information</li>
            <li>Request deletion of your personal data</li>
          </ul>

          <h3>7.3 Restriction and Objection</h3>
          <ul>
            <li>Restrict how we process your data</li>
            <li>Object to processing based on legitimate interests</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h3>7.4 Withdrawal of Consent</h3>
          <ul>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>

          <h3>7.5 Lodge a Complaint</h3>
          <ul>
            <li>File a complaint with your local data protection authority</li>
          </ul>

          <p>To exercise these rights, please contact us at privacy@glazn.com.</p>

          <h2>8. Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your information, including:</p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Secure data storage systems</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
            <li>Employee training on data protection</li>
          </ul>
          <p>
            However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your information.
          </p>

          <h2>9. Age Restrictions and Children's Privacy</h2>
          <p>
            <strong>Age Requirement:</strong> Our Platform contains age-restricted adult content and is strictly for users 18 years of age or older (or the age of majority in your jurisdiction, whichever is higher).
          </p>
          <p>
            <strong>Age Verification:</strong> All users must complete age verification before accessing the Platform. We use third-party age verification services to confirm your age through:
          </p>
          <ul>
            <li>Government-issued ID verification</li>
            <li>Facial recognition technology</li>
            <li>Database cross-referencing</li>
            <li>Credit card verification</li>
          </ul>

          <p>
            <strong>Zero Tolerance for Minors:</strong> We have zero tolerance for minors on our Platform. We do not knowingly collect information from anyone under 18. We employ:
          </p>
          <ul>
            <li>Mandatory age verification for all accounts</li>
            <li>Content moderation and monitoring systems</li>
            <li>Automated detection systems</li>
            <li>User reporting mechanisms</li>
          </ul>

          <p><strong>If We Discover a Minor:</strong> If we discover or are notified that a user is under 18:</p>
          <ul>
            <li>The account will be immediately terminated</li>
            <li>All associated data will be deleted within 24 hours</li>
            <li>We will report the incident to appropriate authorities if required by law</li>
            <li>We will ban the associated payment methods and devices</li>
          </ul>

          <p>
            <strong>Report Minors:</strong> If you believe a minor has accessed the Platform, immediately report it to safety@glazn.com or use our in-app reporting feature. We treat such reports with the highest priority.
          </p>

          <h2>10. Adult Content and Platform Safety</h2>
          <p>
            <strong>Nature of Content:</strong> Our Platform hosts age-restricted adult content. By using the Platform, you acknowledge and consent to potential exposure to:
          </p>
          <ul>
            <li>Nudity and sexual content</li>
            <li>Explicit adult material</li>
            <li>Other age-restricted content</li>
          </ul>

          <p><strong>Content Moderation:</strong> We use a combination of:</p>
          <ul>
            <li>Automated content scanning systems</li>
            <li>Human moderation teams</li>
            <li>User reporting mechanisms</li>
            <li>Machine learning algorithms</li>
          </ul>

          <p>to identify and remove prohibited content, including:</p>
          <ul>
            <li>Content involving minors</li>
            <li>Non-consensual content</li>
            <li>Illegal content</li>
            <li>Content violating our Terms of Service</li>
          </ul>

          <p><strong>Data Used for Safety:</strong> For platform safety, we may process:</p>
          <ul>
            <li>Content metadata and hashes</li>
            <li>User behavior patterns</li>
            <li>Reporting and flagging data</li>
            <li>Device and network information</li>
            <li>Communication metadata</li>
          </ul>

          <p><strong>Cooperation with Authorities:</strong> We cooperate with law enforcement and report suspected illegal activity, including:</p>
          <ul>
            <li>Child sexual abuse material (CSAM)</li>
            <li>Non-consensual intimate images</li>
            <li>Human trafficking indicators</li>
            <li>Other illegal content</li>
          </ul>

          <p>
            We comply with all applicable laws including FOSTA-SESTA, 18 U.S.C. § 2257 record-keeping requirements, and international regulations.
          </p>

          <h2>11. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies for:</p>
          <ul>
            <li>Authentication and security</li>
            <li>Remembering your preferences</li>
            <li>Analytics and performance monitoring</li>
            <li>Advertising and marketing</li>
          </ul>
          <p>
            You can control cookies through your browser settings, but disabling cookies may affect Platform functionality.
          </p>

          <h3>Types of Cookies We Use:</h3>
          <ul>
            <li><strong>Essential Cookies:</strong> Necessary for Platform operation</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences</li>
            <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
            <li><strong>Advertising Cookies:</strong> Deliver relevant advertisements</li>
          </ul>

          <h2>12. Third-Party Links</h2>
          <p>
            Our Platform may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </p>

          <h2>13. Your California Privacy Rights</h2>
          <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to know if personal information is sold or disclosed</li>
            <li>Right to opt-out of the sale of personal information</li>
            <li>Right to deletion of personal information</li>
            <li>Right to non-discrimination for exercising your rights</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>14. European Economic Area (EEA) Users</h2>
          <p>If you are in the EEA, our legal basis for processing your information includes:</p>
          <ul>
            <li><strong>Contract:</strong> Processing necessary to provide our services</li>
            <li><strong>Consent:</strong> Where you have given consent</li>
            <li><strong>Legitimate Interests:</strong> For analytics, fraud prevention, and service improvement</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
          </ul>

          <h2>15. Do Not Track Signals</h2>
          <p>Our Platform does not currently respond to "Do Not Track" signals from browsers.</p>

          <h2>16. Changes to This Privacy Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of material changes by:</p>
          <ul>
            <li>Posting the updated policy on the Platform</li>
            <li>Updating the "Last Updated" date</li>
            <li>Sending you an email notification (for significant changes)</li>
          </ul>
          <p>
            Your continued use of the Platform after changes become effective constitutes acceptance of the revised policy.
          </p>

          <h2>17. Contact Us</h2>
          <p>If you have questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:</p>
          
          <p>
            <strong>Email:</strong> privacy@glazn.com<br />
            <strong>Address:</strong> [Your Company Address]<br />
            <strong>Data Protection Officer:</strong> dpo@glazn.com<br />
            <strong>Safety & Trust Issues:</strong> safety@glazn.com<br />
            <strong>Report Illegal Content:</strong> report@glazn.com
          </p>

          <p>
            For EEA users, you can also contact our EU representative at: [EU Representative Contact Information]
          </p>

          <p>
            <strong>Emergency Reporting:</strong> For urgent safety concerns involving minors or illegal content, contact safety@glazn.com immediately or use the in-app emergency report feature.
          </p>

          <hr className="my-8" />

          <p className="text-center text-muted-foreground">
            <strong>Glazn Inc.</strong><br />
            © 2025 All rights reserved.
          </p>
        </article>
      </div>
    </div>
  );
}

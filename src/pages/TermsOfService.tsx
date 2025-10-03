import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Terms of Service</h1>
          
          <p className="text-muted-foreground">
            <strong>Last Updated: October 3, 2025</strong>
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Glazn ("Platform"), you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Glazn's Platform for personal, non-commercial transitory viewing only.
          </p>

          <h2>3. Age Requirement</h2>
          <p>
            You must be at least 18 years old to use this Platform. By using the Platform, you represent and warrant that you are at least 18 years of age.
          </p>

          <h2>4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2>5. Content Guidelines</h2>
          <p>
            Users must comply with all applicable laws and regulations when posting content. Prohibited content includes but is not limited to:
          </p>
          <ul>
            <li>Content involving minors</li>
            <li>Non-consensual content</li>
            <li>Illegal content</li>
            <li>Content that violates intellectual property rights</li>
          </ul>

          <h2>6. Payment Terms</h2>
          <p>
            All payments are processed securely through third-party payment processors. You agree to provide accurate payment information.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Glazn shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the Platform.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at: legal@glazn.com
          </p>

          <hr />
          
          <p className="text-center text-muted-foreground">
            <strong>Glazn Inc.</strong><br />
            © 2025 All rights reserved.
          </p>
        </article>
      </div>
    </div>
  );
};

export default TermsOfService;

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>

        <article className="bg-white rounded-lg shadow-sm p-6 md:p-8 prose prose-gray max-w-none">
          <h1>Privacy Policy – HSLU Building Information Chatbot</h1>
          <p className="text-gray-500">Last updated: February 2026</p>

          <p>
            This Privacy Policy explains how information is collected and used when you use the
            HSLU Building Information Chatbot (&quot;Chatbot&quot;, &quot;Service&quot;).
          </p>
          <p>
            The Chatbot is operated as an independent student/research project by a UK-registered
            limited company (&quot;Operator&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
          </p>
          <p>
            By using the Chatbot, you acknowledge that you have read and understood this Privacy Policy.
          </p>

          <h2>1. Scope of This Policy</h2>
          <p>
            This Privacy Policy applies solely to interactions with the Chatbot and does not apply
            to external websites or official HSLU systems.
          </p>
          <p>The Chatbot is:</p>
          <ul>
            <li>not an official HSLU service, and</li>
            <li>not affiliated with Lucerne University of Applied Sciences and Arts (HSLU).</li>
          </ul>

          <h2>2. Information We Collect</h2>
          <p>When you use the Chatbot, we may collect and store:</p>
          <ul>
            <li>Questions and messages submitted to the Chatbot</li>
            <li>Timestamps of interactions</li>
          </ul>
          <p>We do not intentionally collect:</p>
          <ul>
            <li>names,</li>
            <li>email addresses,</li>
            <li>student IDs,</li>
            <li>precise location data,</li>
            <li>login credentials.</li>
          </ul>
          <p>Users interact anonymously and no user account is required.</p>

          <h2>3. How We Use the Information</h2>
          <p>Collected data may be used for the following purposes:</p>
          <ul>
            <li>improving the Chatbot&apos;s performance and accuracy,</li>
            <li>analyzing usage patterns and interaction quality,</li>
            <li>research and evaluation of user behavior,</li>
            <li>debugging and security monitoring.</li>
          </ul>
          <p>We do not use Chatbot interactions for marketing or profiling purposes.</p>

          <h2>4. Legal Basis for Processing (UK GDPR)</h2>
          <p>We process data on the basis of:</p>
          <p>legitimate interests (Article 6(1)(f) UK GDPR), namely:</p>
          <ul>
            <li>operating the Chatbot,</li>
            <li>improving system quality,</li>
            <li>conducting research and testing.</li>
          </ul>
          <p>Where applicable, use of the Chatbot constitutes consent to such processing.</p>

          <h2>5. Data Storage and Retention</h2>
          <p>
            Chatbot interaction data is stored securely and retained only for as long as necessary for:
          </p>
          <ul>
            <li>research and evaluation,</li>
            <li>system improvement,</li>
            <li>operational and security purposes.</li>
          </ul>
          <p>We may anonymize or aggregate data for long-term analysis.</p>

          <h2>6. Data Sharing</h2>
          <p>We do not sell or rent user data.</p>
          <p>We may share data only:</p>
          <ul>
            <li>with technical service providers supporting the Chatbot infrastructure,</li>
            <li>where required by law or legal obligation,</li>
            <li>in anonymized or aggregated form for research or reporting.</li>
          </ul>

          <h2>7. International Transfers</h2>
          <p>
            Data may be processed or stored on servers located outside the United Kingdom.
          </p>
          <p>
            Where international transfers occur, appropriate safeguards will be applied in
            accordance with applicable data protection laws.
          </p>

          <h2>8. Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect stored data against:
          </p>
          <ul>
            <li>unauthorized access,</li>
            <li>loss,</li>
            <li>misuse,</li>
            <li>alteration.</li>
          </ul>
          <p>However, no system can be guaranteed to be fully secure.</p>

          <h2>9. User Rights</h2>
          <p>Under applicable data protection laws, you may have the right to:</p>
          <ul>
            <li>request access to your data,</li>
            <li>request correction or deletion,</li>
            <li>object to processing,</li>
            <li>request restriction of processing.</li>
          </ul>
          <p>
            Because the Chatbot does not collect identifying information, it may not always be
            possible to link stored data to a specific user.
          </p>
          <p>Requests may be submitted to the contact address below.</p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>The Chatbot is not intended for children under 18.</p>
          <p>We do not knowingly collect personal data from children.</p>

          <h2>11. Changes to This Policy</h2>
          <p>This Privacy Policy may be updated at any time.</p>
          <p>Continued use of the Chatbot constitutes acceptance of the updated policy.</p>

          <h2>12. Contact</h2>
          <p>For privacy-related questions or requests, contact:</p>
          <p>
            Email:{" "}
            <a href="mailto:tactonetech@gmail.com" className="text-primary-600">
              tactonetech@gmail.com
            </a>
          </p>
        </article>
      </div>
    </div>
  );
}

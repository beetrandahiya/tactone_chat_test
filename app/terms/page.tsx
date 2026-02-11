import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <h1>Terms and Conditions of Use – HSLU Building Information Chatbot</h1>
          <p className="text-gray-500">Last updated: February 2026</p>

          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern your use of the HSLU Building
            Information Chatbot (&quot;Chatbot&quot;, &quot;Service&quot;). By accessing or using the Chatbot,
            you agree to be bound by these Terms. If you do not agree to these Terms, you
            must not use the Chatbot.
          </p>

          <h2>1. About the Service</h2>
          <p>
            The Chatbot is an experimental, independently operated student/research project
            designed to provide general information about buildings of Lucerne University of
            Applied Sciences and Arts (HSLU), including navigation, room locations, opening
            hours, and facilities.
          </p>
          <p>The Chatbot:</p>
          <ul>
            <li>is not an official HSLU service,</li>
            <li>is provided for informational and experimental purposes only, and</li>
            <li>operates using artificial intelligence based on information supplied by the project team.</li>
          </ul>

          <h2>2. No Official Affiliation</h2>
          <p>
            The Chatbot is not affiliated with, endorsed by, or operated by Lucerne University
            of Applied Sciences and Arts (HSLU). All information provided is independent and
            may not reflect official or up-to-date university data.
          </p>

          <h2>3. No Guarantee of Accuracy</h2>
          <p>
            The Chatbot may generate incorrect, incomplete, outdated, or misleading information.
          </p>
          <p>You acknowledge and agree that:</p>
          <ul>
            <li>Information provided by the Chatbot is not guaranteed to be accurate or complete.</li>
            <li>You should not rely solely on the Chatbot for making decisions.</li>
            <li>
              You are responsible for independently verifying any information obtained from the
              Chatbot with official HSLU sources.
            </li>
          </ul>

          <h2>4. No Emergency or Critical Use</h2>
          <p>The Chatbot must not be used:</p>
          <ul>
            <li>in emergencies,</li>
            <li>for safety-critical purposes,</li>
            <li>for medical, legal, or administrative advice,</li>
            <li>to obtain official university decisions or instructions.</li>
          </ul>
          <p>
            The Chatbot does not replace official help desks, reception services, or emergency services.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <p>The operator shall not be liable for any:</p>
          <ul>
            <li>loss or damage arising from reliance on Chatbot responses,</li>
            <li>missed appointments, wrong directions, or delays,</li>
            <li>indirect, incidental, or consequential damages,</li>
            <li>data loss, service interruptions, or inaccuracies.</li>
          </ul>
          <p>Use of the Chatbot is entirely at your own risk.</p>

          <h2>6. User Responsibilities</h2>
          <p>By using the Chatbot, you agree that you will not:</p>
          <ul>
            <li>submit unlawful, abusive, or harmful content,</li>
            <li>attempt to reverse-engineer, manipulate, or disrupt the system,</li>
            <li>use the Chatbot for administrative, contractual, or academic decision-making,</li>
            <li>treat Chatbot responses as official guidance.</li>
          </ul>
          <p>You are solely responsible for how you use the information provided.</p>

          <h2>7. Data Collection</h2>
          <p>The Chatbot may log:</p>
          <ul>
            <li>user questions,</li>
            <li>timestamps of interactions.</li>
          </ul>
          <p>Users interact anonymously. No account or login is required.</p>
          <p>Data may be used for:</p>
          <ul>
            <li>research,</li>
            <li>system improvement,</li>
            <li>analysis of user interaction patterns.</li>
          </ul>
          <p>No guarantee is made that the system is free from vulnerabilities or errors.</p>
          <p>(Privacy practices will be governed by a separate Privacy Policy.)</p>

          <h2>8. Age Requirement</h2>
          <p>
            By using the Chatbot, you confirm that you are at least 18 years old, or that you
            have permission from a parent or legal guardian to use the Service.
          </p>

          <h2>9. Availability</h2>
          <p>The Chatbot is provided on an &quot;as is&quot; and &quot;as available&quot; basis.</p>
          <p>The operator reserves the right to:</p>
          <ul>
            <li>modify or discontinue the Chatbot at any time,</li>
            <li>restrict access without notice,</li>
            <li>update these Terms.</li>
          </ul>

          <h2>10. Changes to These Terms</h2>
          <p>
            These Terms may be updated at any time. Continued use of the Chatbot after changes
            constitutes acceptance of the updated Terms.
          </p>

          <h2>11. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            England and Wales.
          </p>
          <p>
            Any disputes arising from or related to these Terms or use of the Chatbot shall be
            subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>

          <h2>12. Contact</h2>
          <p>For questions or concerns regarding these Terms, please contact:</p>
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

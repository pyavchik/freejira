'use client'

interface TermsAndConditionsProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsAndConditions({ isOpen, onClose }: TermsAndConditionsProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
            <p className="text-gray-600 dark:text-gray-400 italic">
              Last updated: December 27, 2025
            </p>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing and using FreeJira, you accept and agree to be bound by the terms
                and provisions of this agreement. If you do not agree to these terms, please do
                not use our service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                2. Use License
              </h3>
              <p>
                Permission is granted to use FreeJira for personal or commercial project
                management purposes. This is the grant of a license, not a transfer of title,
                and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without authorization</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                3. User Accounts
              </h3>
              <p>
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your account. You agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete registration information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                4. Privacy and Data Protection
              </h3>
              <p>
                Your use of FreeJira is also governed by our Privacy Policy. We collect and
                process your personal data in accordance with applicable data protection laws.
                We take reasonable measures to protect your information but cannot guarantee
                absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                5. Prohibited Uses
              </h3>
              <p>
                You may not use FreeJira:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>For any illegal or unauthorized purpose</li>
                <li>To violate any laws in your jurisdiction</li>
                <li>To transmit any malicious code, viruses, or harmful content</li>
                <li>To harass, abuse, or harm other users</li>
                <li>To impersonate any person or entity</li>
                <li>To interfere with or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                6. Content and Intellectual Property
              </h3>
              <p>
                You retain ownership of any content you submit to FreeJira. However, by
                submitting content, you grant us a license to use, modify, and display that
                content as necessary to provide the service. You represent that you have the
                right to submit any content you provide.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                7. Service Availability
              </h3>
              <p>
                We strive to maintain high availability but do not guarantee uninterrupted
                access to FreeJira. We may modify, suspend, or discontinue any part of the
                service at any time without notice. We are not liable for any modification,
                suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                8. Disclaimer of Warranties
              </h3>
              <p>
                FreeJira is provided "as is" without any warranties, express or implied. We
                disclaim all warranties including, but not limited to, implied warranties of
                merchantability, fitness for a particular purpose, and non-infringement. We do
                not warrant that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The service will meet your requirements</li>
                <li>The service will be uninterrupted, timely, secure, or error-free</li>
                <li>Any errors in the service will be corrected</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                9. Limitation of Liability
              </h3>
              <p>
                To the maximum extent permitted by law, FreeJira and its suppliers shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages,
                or any loss of profits or revenues, whether incurred directly or indirectly, or
                any loss of data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your access to or use of (or inability to access or use) the service</li>
                <li>Any unauthorized access to or use of our servers</li>
                <li>Any bugs, viruses, or other harmful code transmitted to or through the service</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                10. Indemnification
              </h3>
              <p>
                You agree to indemnify and hold harmless FreeJira and its officers, directors,
                employees, and agents from any claims, damages, losses, liabilities, and expenses
                (including legal fees) arising from your use of the service or violation of these
                terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                11. Changes to Terms
              </h3>
              <p>
                We reserve the right to modify these terms at any time. We will provide notice
                of significant changes by posting the new terms on our website. Your continued
                use of the service after changes are posted constitutes your acceptance of the
                modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                12. Termination
              </h3>
              <p>
                We may terminate or suspend your account and access to the service immediately,
                without prior notice, for any reason, including if you breach these terms. Upon
                termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                13. Governing Law
              </h3>
              <p>
                These terms shall be governed by and construed in accordance with applicable
                laws, without regard to conflict of law provisions. Any disputes arising from
                these terms or your use of the service shall be resolved in the appropriate courts.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                14. Contact Information
              </h3>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="mt-2">
                Email: <span className="font-medium">support@freejira.com</span>
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

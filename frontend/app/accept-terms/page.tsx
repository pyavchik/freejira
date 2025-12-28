'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function AcceptTermsPage() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        // Check if user already accepted terms
        const user = await authService.getMe()
        if (user.acceptedTerms) {
          // Already accepted, redirect to dashboard
          router.push('/dashboard')
        }
      } catch (error) {
        // If error, redirect to login
        router.push('/login')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleAccept = async () => {
    if (!accepted) {
      toast.error('Please check the box to accept Terms and Conditions')
      return
    }

    setIsLoading(true)

    try {
      await authService.acceptTerms()
      toast.success('Terms accepted successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Failed to accept terms: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Accept Terms and Conditions
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
            Please review and accept our Terms and Conditions to continue
          </p>
        </div>

        {/* Terms Content - Full Display */}
        <div className="max-h-[60vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
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

        {/* Acceptance Checkbox */}
        <div className="flex items-start space-x-3">
          <input
            id="accept-terms"
            name="accept-terms"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-5 w-5 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="accept-terms"
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            I have read and agree to the Terms and Conditions
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleAccept}
            disabled={!accepted || isLoading}
            className="flex-1 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin inline-block -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accepting...
              </>
            ) : (
              'Accept and Continue'
            )}
          </button>
          <button
            onClick={() => authService.logout()}
            disabled={isLoading}
            className="py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Decline and Logout
          </button>
        </div>
      </div>
    </div>
  )
}

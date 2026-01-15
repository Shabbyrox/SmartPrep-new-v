// src/app/auth/verify-email/page.tsx
export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Check your email
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    We&apos;ve sent you a confirmation link. Please check your email to verify your account.
                </p>
            </div>
        </div>
    )
}

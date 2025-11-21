import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
    onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-amber-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Privacy Policy</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-gray-600 mb-6">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
                        <p className="text-gray-600 mb-4">
                            Welcome to Abdulla Islamic Store. We are committed to protecting your personal information and your right to privacy.
                            If you have any questions or concerns about this privacy notice or our practices with regards to your personal information,
                            please contact us at info@abdullaislamicstore.com.
                        </p>
                        <p className="text-gray-600">
                            This privacy notice describes how we might use your information if you:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li>Visit our website</li>
                            <li>Engage with us in other related ways</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            In this privacy notice, if we refer to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li>"Website," we are referring to any website of ours that references or links to this policy</li>
                            <li>"Services," we are referring to our website, and other related services, including any sales or marketing activities</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                        <p className="text-gray-600 mb-4">
                            We collect personal information that you voluntarily provide to us when you register on the website,
                            express an interest in obtaining information about us or our products and services, participate in activities
                            on the website, or otherwise contact us.
                        </p>
                        <p className="text-gray-600 mb-4">
                            The personal information we collect may include:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li>Names</li>
                            <li>Phone numbers</li>
                            <li>Email addresses</li>
                            <li>Mailing addresses</li>
                            <li>Billing and shipping information</li>
                            <li>Payment information</li>
                            <li>Order history</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                        <p className="text-gray-600 mb-4">
                            We use personal information collected via our website for a variety of business purposes described below:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li>To facilitate account creation and logon process</li>
                            <li>To manage user accounts</li>
                            <li>To send administrative information to you</li>
                            <li>To fulfill and manage your orders</li>
                            <li>To respond to user inquiries and offer support</li>
                            <li>To send you marketing and promotional communications</li>
                            <li>To protect our services</li>
                            <li>To comply with applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sharing Your Information</h2>
                        <p className="text-gray-600 mb-4">
                            We may process or share your data that we hold based on the following legal basis:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li><strong>Consent:</strong> We may process your data if you have given us specific consent to use your personal information</li>
                            <li><strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary to achieve our legitimate business interests</li>
                            <li><strong>Performance of a Contract:</strong> Where we have entered into a contract with you, we may process your personal information</li>
                            <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
                        <p className="text-gray-600">
                            We use administrative, technical, and physical security measures to help protect your personal information.
                            While we have taken reasonable steps to secure the personal information you provide to us, please be aware
                            that despite our efforts, no security measures are perfect or impenetrable.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
                        <p className="text-gray-600 mb-4">
                            In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow
                            you greater access to and control over your personal information. You may review, change, or terminate your
                            account at any time.
                        </p>
                        <p className="text-gray-600">
                            In some regions, such as the EEA and UK, you have certain rights under applicable data protection laws:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li>The right to request access and obtain a copy of your personal information</li>
                            <li>The right to request rectification or erasure</li>
                            <li>The right to restrict the processing of your personal information</li>
                            <li>The right to data portability</li>
                            <li>The right to withdraw consent</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                        <p className="text-gray-600">
                            If you have questions or comments about this notice, you may email us at info@abdullaislamicstore.com
                            or by post to:
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Abdulla Islamic Store</p>
                            <p className="text-gray-600">123 Abdulla ART Street</p>
                            <p className="text-gray-600">Kanpur, India</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
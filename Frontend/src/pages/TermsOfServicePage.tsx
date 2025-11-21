import { ArrowLeft } from 'lucide-react';

interface TermsOfServicePageProps {
    onBack: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Terms of Service</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-gray-600 mb-6">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
                        <p className="text-gray-600 mb-4">
                            Welcome to Abdulla Islamic Store. These Terms of Service ("Terms") govern your access to and use of our
                            website and services. By accessing or using our website, you agree to be bound by these Terms and our
                            Privacy Policy.
                        </p>
                        <p className="text-gray-600">
                            Please read these Terms carefully before accessing or using our services. If you do not agree to all the
                            terms and conditions of this agreement, you may not access the website or use any services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
                        <p className="text-gray-600 mb-4">
                            Abdulla Islamic Store provides an online e-commerce platform for purchasing Islamic home decor, art,
                            and related products. Our services include:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                            <li>Online product catalog and shopping</li>
                            <li>Order processing and fulfillment</li>
                            <li>Customer support and communication</li>
                            <li>Product information and descriptions</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accounts</h2>
                        <p className="text-gray-600 mb-4">
                            When you create an account with us, you must provide accurate and complete information. You are
                            responsible for maintaining the confidentiality of your account and password and for restricting access
                            to your computer. You agree to accept responsibility for all activities that occur under your account.
                        </p>
                        <p className="text-gray-600">
                            You may not use as a username the name of another person or entity or that is not lawfully available
                            for use, a name or trademark that is subject to any rights of another person or entity other than
                            yourself, without appropriate authorization. You may not use as a username any name that is offensive,
                            vulgar or obscene.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders and Payments</h2>
                        <p className="text-gray-600 mb-4">
                            By placing an order, you are making an offer to purchase the products. All orders are subject to
                            acceptance and availability. We reserve the right to refuse any order for any reason.
                        </p>
                        <p className="text-gray-600 mb-4">
                            You agree to provide current, complete, and accurate purchase and account information. You agree to
                            pay all charges incurred by your account, including applicable taxes and shipping fees.
                        </p>
                        <p className="text-gray-600">
                            We may suspend or terminate your account if we suspect fraudulent, illegal, or unauthorized activity.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing and Product Information</h2>
                        <p className="text-gray-600 mb-4">
                            We endeavor to display accurate pricing information, however, errors may occur. We reserve the right
                            to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders
                            in any event.
                        </p>
                        <p className="text-gray-600">
                            Product descriptions, images, and other content are for informational purposes only and may not be
                            completely accurate. We do not warrant that product descriptions or other content is accurate, complete,
                            reliable, current, or error-free.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping and Delivery</h2>
                        <p className="text-gray-600 mb-4">
                            Shipping costs are calculated at checkout based on your location and the items in your order.
                            Delivery times are estimates and not guaranteed.
                        </p>
                        <p className="text-gray-600">
                            Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.
                            We are not responsible for delays caused by shipping carriers or customs.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Returns and Refunds</h2>
                        <p className="text-gray-600 mb-4">
                            We accept returns within 30 days of purchase for most items. Items must be in new, unused condition
                            with all original packaging.
                        </p>
                        <p className="text-gray-600">
                            Refunds will be processed within 5-7 business days after we receive the returned item. Shipping costs
                            are non-refundable unless the return is due to our error.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
                        <p className="text-gray-600 mb-4">
                            All content included on this site, such as text, graphics, logos, button icons, images, audio clips,
                            digital downloads, data compilations, and software, is the property of Abdulla Islamic Store or its
                            content suppliers and protected by international copyright laws.
                        </p>
                        <p className="text-gray-600">
                            The compilation of all content on this site is the exclusive property of Abdulla Islamic Store and
                            protected by international copyright laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                        <p className="text-gray-600">
                            In no event shall Abdulla Islamic Store, nor its directors, employees, partners, agents, suppliers,
                            or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
                            including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                            resulting from your access to or use of or inability to access or use the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
                        <p className="text-gray-600">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                            If a revision is material, we will provide at least 30 days' notice prior to any new terms
                            taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Abdulla Islamic Store</p>
                            <p className="text-gray-600">Email: info@abdullaislamicstore.com</p>
                            <p className="text-gray-600">Phone: +91 (740) 809-7278</p>
                            <p className="text-gray-600">Address: 123 Abdulla ART Street, Kanpur, India</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
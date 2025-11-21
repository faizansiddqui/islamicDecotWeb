import { ArrowLeft, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, MessageCircle } from 'lucide-react';

interface ContactPageProps {
    onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>

                <div className="flex justify-center">
                    <div className="w-full max-w-2xl">
                        {/* Contact Information */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <h2 className="text-xl font-semibold mb-4 text-center">Get in Touch</h2>
                            <p className="text-gray-600 mb-6 text-center">
                                We'd love to hear from you. Our team is here to help with any questions or concerns.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Address</h3>
                                        <p className="text-gray-600">123 Abdulla ART Street, Kanpur, India</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Phone</h3>
                                        <a href="tel:+917408097278" className="text-gray-600 hover:text-amber-600 transition-colors">+91 (740) 809-7278</a>
                                        <p className="text-sm text-gray-500">Mon-Sat, 9AM-6PM IST</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email</h3>
                                        <a href="mailto:info@abdullaislamicstore.com" className="text-gray-600 hover:text-amber-600 transition-colors">info@abdullaislamicstore.com</a>
                                        <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <MessageCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">WhatsApp</h3>
                                        <a
                                            href="https://wa.me/917408097278?text=Hi%20Abdulla%20Islamic%20Store%2C%20I%20came%20across%20your%20website%20and%20would%20like%20to%20discuss%20about%20products.%20"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-amber-600 transition-colors"
                                        >
                                            Chat with us on WhatsApp
                                        </a>
                                        <p className="text-sm text-gray-500">Available during business hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                            <h3 className="font-semibold text-gray-900 mb-2 text-center">Business Hours</h3>
                            <div className="space-y-1 text-sm text-gray-700 text-center">
                                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                <p>Saturday: 10:00 AM - 4:00 PM</p>
                                <p>Sunday: Closed</p>
                            </div>
                        </div>

                        {/* Social Media Section */}
                        <div className="bg-white mt-5 p-6 rounded-lg shadow-sm mb-6">
                            <h2 className="text-xl font-semibold mb-4 text-center">Follow Us</h2>
                            <p className="text-gray-600 mb-4 text-center">
                                Stay connected with us on social media for updates and promotions.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <a
                                    href="https://www.facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-gray-100 hover:bg-amber-100 rounded-full transition-colors"
                                >
                                    <Facebook className="w-6 h-6 text-gray-700 hover:text-amber-600" />
                                </a>
                                <a
                                    href="https://www.instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-gray-100 hover:bg-amber-100 rounded-full transition-colors"
                                >
                                    <Instagram className="w-6 h-6 text-gray-700 hover:text-amber-600" />
                                </a>
                                <a
                                    href="https://www.youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-gray-100 hover:bg-amber-100 rounded-full transition-colors"
                                >
                                    <Youtube className="w-6 h-6 text-gray-700 hover:text-amber-600" />
                                </a>
                                <a
                                    href="https://www.twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-gray-100 hover:bg-amber-100 rounded-full transition-colors"
                                >
                                    <Twitter className="w-6 h-6 text-gray-700 hover:text-amber-600" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const modalContent = {
        terms: {
            title: 'Terms of Service',
            content: (
                <>
                    <p className="mb-4">
                        These Terms of Use reflect the way Horizon works, the laws that apply to our company, and certain things we've always believed to be true. As a result, these Terms of Use help define Horizon's relationship with you as you interact with our services.
                    </p>

                    <h3 className="text-lg font-semibold mt-4 mb-2">The Horizon Service</h3>
                    <p className="mb-4">
                        We agree to provide you with the Horizon Service. The Service includes all of the Horizon products, features, applications, services, technologies, and software that we provide to advance Horizon's mission: To bring you closer to the people and things you love. The Service is made up of the following aspects:
                    </p>

                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>Offering personalized opportunities to create, connect, communicate, discover, and share.</strong> People are different. We want to strengthen your relationships through shared experiences you actually care about.
                        </li>
                        <li>
                            <strong>Fostering a positive, inclusive, and safe environment.</strong> We develop and use tools and offer resources to our community members that help to make their experiences positive and inclusive, including when we think they might need help.
                        </li>
                        <li>
                            <strong>Developing and using technologies that help us consistently serve our growing community.</strong> Organizing and analyzing information for our growing community is central to our Service.
                        </li>
                        <li>
                            <strong>Providing consistent and seamless experiences across other Horizon products and services.</strong> Horizon is part of a broader ecosystem of services and applications designed to make your experience more meaningful and valuable.
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Your Commitments</h3>
                    <p className="mb-4">
                        In return for our commitment to provide the Service, we require you to make the following commitments to us:
                    </p>

                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>Use the same name that you use in everyday life.</strong> This helps everyone know who they're connecting with.
                        </li>
                        <li>
                            <strong>Provide accurate information about yourself.</strong> This helps us to keep our community authentic and enables proper services.
                        </li>
                        <li>
                            <strong>Follow the law.</strong> You are responsible for your conduct and content.
                        </li>
                        <li>
                            <strong>Respect intellectual property.</strong> Don't post content that violates someone else's intellectual property rights.
                        </li>
                    </ul>

                    <p className="mb-4">
                        By using our Service, you agree to these terms. If you don't agree to these terms, you may not use our Service.
                    </p>
                </>
            ),
        },
        privacy: {
            title: 'Privacy Policy',
            content: (
                <>
                    <p className="mb-4">
                        We want you to understand how and why Horizon collects, uses, and shares information about you when you use our services or when you otherwise interact with us.
                    </p>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Information We Collect</h3>
                    <p className="mb-4">
                        We collect the following types of information:
                    </p>

                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>Information you provide to us directly:</strong> We collect information you provide when you register for an account, create or share content, and message or communicate with others.
                        </li>
                        <li>
                            <strong>Information we collect when you use our services:</strong> This includes information about how you use our platform, the content you view, and the actions you take, as well as information about your device.
                        </li>
                        <li>
                            <strong>Information we obtain from other sources:</strong> We may receive information about you from other services or third-party partners.
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">How We Use Information</h3>
                    <p className="mb-4">
                        We use the information we collect to:
                    </p>

                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Provide, personalize, and improve our services</li>
                        <li>Facilitate sharing and connections between users</li>
                        <li>Research and develop new services</li>
                        <li>Promote safety, integrity, and security</li>
                        <li>Communicate with you</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">How We Share Information</h3>
                    <p className="mb-4">
                        We share information in the following ways:
                    </p>

                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>With other users according to your privacy settings</li>
                        <li>With our service providers and partners</li>
                        <li>For legal reasons, if required</li>
                        <li>With your consent or at your direction</li>
                    </ul>

                    <p className="mb-4">
                        By using our Service, you agree to this Privacy Policy. You can always manage your privacy settings or delete your account if you no longer wish to use our services.
                    </p>
                </>
            ),
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-dark-2 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden z-10 mx-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-dark-4">
                            <h2 className="text-xl font-bold text-light-1">
                                {modalContent[type].title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-dark-3 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5 text-light-2" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto scrollbar-hide max-h-[70vh] text-light-2">
                            {modalContent[type].content}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-dark-4 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-light-1 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;
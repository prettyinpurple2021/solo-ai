import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';

export function PrivacyPolicy() {
    return (
        <MarketingLayout>
            <div className="max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-zinc-400 mb-6">Last updated: November 23, 2025</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p className="text-zinc-400">
                            SoloSuccess AI ("we", "our", or "us") respects your privacy and is committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                        <p className="text-zinc-400 mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                        <p className="text-zinc-400 mb-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p className="text-zinc-400">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p className="text-zinc-400">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: <br />
                            <a href="mailto:support@solosuccesss.com" className="text-emerald-400 hover:underline">support@solosuccesss.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </MarketingLayout>
    );
}

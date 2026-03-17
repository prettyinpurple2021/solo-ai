import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';

export function TermsOfService() {
    return (
        <MarketingLayout>
            <div className="max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-zinc-400 mb-6">Last updated: November 23, 2025</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                        <p className="text-zinc-400">
                            By accessing our website at solosuccessai.fun, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                        <p className="text-zinc-400 mb-4">
                            Permission is granted to temporarily download one copy of the materials (information or software) on SoloSuccess AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>attempt to decompile or reverse engineer any software contained on SoloSuccess AI's website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
                        <p className="text-zinc-400">
                            The materials on SoloSuccess AI's website are provided on an 'as is' basis. SoloSuccess AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                        <p className="text-zinc-400">
                            In no event shall SoloSuccess AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SoloSuccess AI's website, even if SoloSuccess AI or a SoloSuccess AI authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Governing Law</h2>
                        <p className="text-zinc-400">
                            These terms and conditions are governed by and construed in accordance with the laws of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </section>
                </div>
            </div>
        </MarketingLayout>
    );
}

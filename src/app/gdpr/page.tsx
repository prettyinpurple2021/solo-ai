"use client"

import Link from "next/link"
import { Shield, FileText, Download, Trash2, Edit, Eye, Lock, CheckCircle } from "lucide-react"
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Heading } from '@/components/ui/Heading'
import { PrimaryButton } from '@/components/ui/button'

export default function GDPRPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-purple/30 bg-neon-purple/5 rounded-none mb-6">
              <Shield className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold tracking-widest text-neon-purple uppercase">GDPR Compliance</span>
            </div>
            <Heading level={1} color="purple" className="text-4xl md:text-6xl mb-6">
              YOUR DATA <span className="text-neon-purple">RIGHTS</span>
            </Heading>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-mono">
              Under the General Data Protection Regulation (GDPR), you have specific rights regarding your personal data. 
              Here&apos;s how we protect your privacy and how you can exercise your rights.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-4 font-mono">
              <FileText className="w-4 h-4" />
              <span>GDPR Compliant Since: May 2018</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* What is GDPR */}
            <HudBorder className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold font-orbitron">1</span>
                <Heading level={2} color="purple" className="text-2xl">WHAT IS GDPR?</Heading>
              </div>
              <p className="text-gray-300 font-mono leading-relaxed mb-4">
                The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. 
                It applies to all companies that process personal data of individuals in the European Union, regardless of where the company is located.
              </p>
              <div className="bg-neon-cyan/10 border-l-4 border-neon-cyan p-4 rounded-sm">
                <p className="text-gray-300 text-sm font-mono">
                  <strong className="text-neon-cyan">At SoloSuccess AI:</strong> We fully comply with GDPR requirements and are committed to protecting your personal data with the highest standards of privacy and security.
                </p>
              </div>
            </HudBorder>

            {/* Your GDPR Rights */}
            <HudBorder className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold font-orbitron">2</span>
                <Heading level={2} color="purple" className="text-2xl">YOUR GDPR RIGHTS</Heading>
              </div>
              <p className="text-gray-300 font-mono leading-relaxed mb-6">
                Under GDPR, you have several important rights regarding your personal data:
              </p>
              
              <div className="space-y-6">
                <HudBorder variant="hover" className="p-6 border-l-4 border-neon-lime">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-neon-lime" />
                    <Heading level={3} color="lime" className="text-lg">Right to Access (Article 15)</Heading>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    You have the right to know what personal data we hold about you and how we use it.
                  </p>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                    <li>Request a copy of your personal data</li>
                    <li>Understand how we process your data</li>
                    <li>Know who we share your data with</li>
                    <li>Learn how long we keep your data</li>
                  </ul>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-l-4 border-neon-cyan">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit className="w-5 h-5 text-neon-cyan" />
                    <Heading level={3} color="cyan" className="text-lg">Right to Rectification (Article 16)</Heading>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    You can request that we correct any inaccurate or incomplete personal data.
                  </p>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                    <li>Update incorrect information</li>
                    <li>Complete missing information</li>
                    <li>Ensure your data is accurate and current</li>
                  </ul>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-l-4 border-neon-magenta">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-5 h-5 text-neon-magenta" />
                    <Heading level={3} color="magenta" className="text-lg">Right to Erasure (Article 17)</Heading>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    Also known as the &quot;right to be forgotten&quot; - you can request deletion of your personal data.
                  </p>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                    <li>Delete your account and all associated data</li>
                    <li>Remove data that&apos;s no longer necessary</li>
                    <li>Withdraw consent for data processing</li>
                  </ul>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-l-4 border-neon-purple">
                  <div className="flex items-center gap-2 mb-3">
                    <Download className="w-5 h-5 text-neon-purple" />
                    <Heading level={3} color="purple" className="text-lg">Right to Data Portability (Article 20)</Heading>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    You can request your data in a portable format to transfer to another service.
                  </p>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                    <li>Export your data in JSON or CSV format</li>
                    <li>Transfer your data to another platform</li>
                    <li>Maintain data continuity when switching services</li>
                  </ul>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-l-4 border-neon-orange">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-neon-orange" />
                    <Heading level={3} color="orange" className="text-lg">Right to Restrict Processing (Article 18)</Heading>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    You can request that we limit how we process your personal data.
                  </p>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                    <li>Suspend data processing temporarily</li>
                    <li>Limit use to specific purposes only</li>
                    <li>Maintain data while resolving disputes</li>
                  </ul>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-l-4 border-gray-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-gray-300" />
                    <Heading level={3} color="white" className="text-lg">Right to Object (Article 21)</Heading>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    You can object to certain types of data processing, especially for marketing purposes.
                  </p>
                  <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                    <li>Stop direct marketing communications</li>
                    <li>Object to automated decision-making</li>
                    <li>Opt out of profiling activities</li>
                  </ul>
                </HudBorder>
              </div>
            </HudBorder>

            {/* How to Exercise Your Rights */}
            <HudBorder className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold font-orbitron">3</span>
                <Heading level={2} color="purple" className="text-2xl">HOW TO EXERCISE YOUR RIGHTS</Heading>
              </div>
              
              <HudBorder variant="hover" className="p-6 mb-6 border-neon-purple/30">
                <Heading level={3} color="purple" className="mb-3">Contact Our Data Protection Officer</Heading>
                <p className="text-gray-300 text-sm mb-4 font-mono">
                  To exercise any of your GDPR rights, please contact us using the information below:
                </p>
                <div className="bg-dark-bg/50 p-4 rounded border border-neon-purple/30">
                  <p className="text-neon-purple font-semibold mb-1 font-mono">psychedelic.creator@enchantednightmare.com</p>
                  <p className="text-gray-300 text-sm font-mono">Subject: GDPR Data Request - [Your Request Type]</p>
                </div>
              </HudBorder>

              <div className="grid gap-4">
                <HudBorder variant="hover" className="p-4 border-neon-cyan/30">
                  <Heading level={3} color="cyan" className="mb-2 text-base">Response Time</Heading>
                  <p className="text-gray-300 text-sm font-mono">
                    We will respond to your request within 30 days (or 1 month) as required by GDPR. 
                    In complex cases, we may extend this by an additional 2 months and will inform you of any delay.
                  </p>
                </HudBorder>
                
                <HudBorder variant="hover" className="p-4 border-neon-lime/30">
                  <Heading level={3} color="lime" className="mb-2 text-base">No Cost</Heading>
                  <p className="text-gray-300 text-sm font-mono">
                    Exercising your GDPR rights is completely free of charge. We will not charge you for processing legitimate requests.
                  </p>
                </HudBorder>

                <HudBorder variant="hover" className="p-4 border-neon-orange/30">
                  <Heading level={3} color="orange" className="mb-2 text-base">Identity Verification</Heading>
                  <p className="text-gray-300 text-sm font-mono">
                    To protect your privacy, we may need to verify your identity before processing certain requests. 
                    This helps ensure your personal data isn&apos;t disclosed to unauthorized parties.
                  </p>
                </HudBorder>
              </div>
            </HudBorder>

            {/* Our GDPR Compliance Commitment */}
            <HudBorder className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold font-orbitron">4</span>
                <Heading level={2} color="purple" className="text-2xl">OUR GDPR COMPLIANCE COMMITMENT</Heading>
              </div>
              
              <div className="grid gap-6">
                <HudBorder variant="hover" className="p-6 border-neon-lime/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-neon-lime" />
                    <Heading level={3} color="lime" className="text-lg">Data Protection by Design</Heading>
                  </div>
                  <p className="text-gray-300 text-sm font-mono">
                    We build privacy protection into every aspect of SoloSuccess AI from the ground up. 
                    Data protection isn&apos;t an afterthought - it&apos;s fundamental to how we operate.
                  </p>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-neon-cyan/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-neon-cyan" />
                    <Heading level={3} color="cyan" className="text-lg">Minimal Data Collection</Heading>
                  </div>
                  <p className="text-gray-300 text-sm font-mono">
                    We only collect personal data that is necessary for providing our services. 
                    We don&apos;t collect data &quot;just in case&quot; - every piece of data has a specific purpose.
                  </p>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-neon-purple/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-neon-purple" />
                    <Heading level={3} color="purple" className="text-lg">Strong Security Measures</Heading>
                  </div>
                  <p className="text-gray-300 text-sm font-mono">
                    Your data is protected with enterprise-grade security including encryption, access controls, 
                    and regular security audits to prevent unauthorized access or data breaches.
                  </p>
                </HudBorder>

                <HudBorder variant="hover" className="p-6 border-neon-orange/30">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-neon-orange" />
                    <Heading level={3} color="orange" className="text-lg">Transparent Processing</Heading>
                  </div>
                  <p className="text-gray-300 text-sm font-mono">
                    We provide clear information about how we collect, use, and store your data. 
                    No hidden practices - everything is documented in our Privacy Policy.
                  </p>
                </HudBorder>
              </div>
            </HudBorder>

            {/* International Data Transfers */}
            <HudBorder className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold font-orbitron">5</span>
                <Heading level={2} color="purple" className="text-2xl">INTERNATIONAL DATA TRANSFERS</Heading>
              </div>
              
              <HudBorder variant="hover" className="p-6 border-l-4 border-neon-cyan">
                <p className="text-gray-300 text-sm mb-4 font-mono">
                  SoloSuccess AI uses cloud infrastructure that may involve transferring your data outside the European Economic Area (EEA). 
                  When we do this, we ensure adequate protection through:
                </p>
                <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                  <li><strong className="text-neon-cyan">Adequacy Decisions:</strong> Transferring to countries deemed adequate by the European Commission</li>
                  <li><strong className="text-neon-cyan">Standard Contractual Clauses:</strong> Using EU-approved contractual safeguards</li>
                  <li><strong className="text-neon-cyan">Certified Providers:</strong> Working only with cloud providers that meet EU data protection standards</li>
                </ul>
              </HudBorder>
            </HudBorder>

            {/* Filing a Complaint */}
            <HudBorder className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold font-orbitron">6</span>
                <Heading level={2} color="purple" className="text-2xl">FILING A COMPLAINT</Heading>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-4 font-mono">
                If you&apos;re not satisfied with how we&apos;ve handled your personal data or your GDPR rights, you have the right to file a complaint with a supervisory authority.
              </p>
              
              <HudBorder variant="hover" className="p-6 border-l-4 border-neon-magenta">
                <Heading level={3} color="magenta" className="mb-3">EU Supervisory Authorities</Heading>
                <p className="text-gray-300 text-sm mb-3 font-mono">
                  You can file a complaint with the data protection authority in your EU country. Some key authorities include:
                </p>
                <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 font-mono">
                  <li><strong className="text-neon-magenta">Germany:</strong> Federal Commissioner for Data Protection and Freedom of Information</li>
                  <li><strong className="text-neon-magenta">France:</strong> Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</li>
                  <li><strong className="text-neon-magenta">UK:</strong> Information Commissioner&apos;s Office (ICO)</li>
                  <li><strong className="text-neon-magenta">Ireland:</strong> Data Protection Commission (DPC)</li>
                </ul>
              </HudBorder>
            </HudBorder>

            {/* Contact Information */}
            <HudBorder variant="hover" className="p-8 border-neon-purple/30">
              <Heading level={3} color="purple" className="mb-3">QUESTIONS ABOUT GDPR?</Heading>
              <p className="text-gray-300 text-sm mb-4 font-mono">
                If you have any questions about GDPR, your rights, or our data practices, please contact us:
              </p>
              <div className="bg-dark-bg/50 p-4 rounded border border-neon-purple/30">
                <p className="text-neon-purple font-semibold font-mono">psychedelic.creator@enchantednightmare.com</p>
                <p className="text-gray-300 text-sm mt-1 font-mono">Subject: GDPR Information Request</p>
              </div>
            </HudBorder>
          </div>

          {/* Related Links */}
          <div className="mt-16">
            <Heading level={2} color="cyan" className="text-2xl mb-6 text-center">RELATED INFORMATION</Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/privacy">
                <HudBorder variant="hover" className="p-6 text-center cursor-pointer border-neon-purple/30">
                  <Shield className="w-12 h-12 text-neon-purple mx-auto mb-4" />
                  <Heading level={4} color="purple" className="text-lg mb-2">Privacy Policy</Heading>
                  <p className="text-gray-300 text-sm font-mono">Detailed information about our data practices</p>
                </HudBorder>
              </Link>

              <Link href="/cookies">
                <HudBorder variant="hover" className="p-6 text-center cursor-pointer border-neon-purple/30">
                  <FileText className="w-12 h-12 text-neon-purple mx-auto mb-4" />
                  <Heading level={4} color="purple" className="text-lg mb-2">Cookie Policy</Heading>
                  <p className="text-gray-300 text-sm font-mono">How we use cookies and tracking technologies</p>
                </HudBorder>
              </Link>

              <Link href="/contact">
                <HudBorder variant="hover" className="p-6 text-center cursor-pointer border-neon-purple/30">
                  <CheckCircle className="w-12 h-12 text-neon-purple mx-auto mb-4" />
                  <Heading level={4} color="purple" className="text-lg mb-2">Contact Us</Heading>
                  <p className="text-gray-300 text-sm font-mono">Get in touch with our data protection team</p>
                </HudBorder>
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <HudBorder className="p-8 border-neon-purple/30">
              <Heading level={2} color="purple" className="text-4xl md:text-5xl mb-6">YOUR PRIVACY, OUR PRIORITY</Heading>
              <p className="text-xl text-gray-300 mb-8 font-mono">
                Start your journey with confidence, knowing your data is protected by industry-leading privacy standards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <PrimaryButton variant="purple" size="lg">
                    Get Started
                  </PrimaryButton>
                </Link>
                <Link href="/contact">
                  <PrimaryButton variant="cyan" size="lg">
                    Contact Data Protection Team
                  </PrimaryButton>
                </Link>
              </div>
            </HudBorder>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}

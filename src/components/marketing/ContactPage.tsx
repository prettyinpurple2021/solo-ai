import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContactPage() {
    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16">
                    <div>
                        <h1 className="text-4xl font-orbitron font-bold mb-6 text-white uppercase tracking-wider">Get in Touch</h1>
                        <p className="text-xl text-gray-400 mb-12 font-mono">
                            Have questions about SoloSuccess AI? We're here to help you build your empire.
                        </p>

                        <div className="space-y-8 font-mono">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-sm bg-neon-lime/10 text-neon-lime border border-neon-lime/20">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1 uppercase tracking-wide">Email Us</h3>
                                    <p className="text-gray-400">support@solosuccesss.com</p>
                                    <p className="text-gray-500 text-sm mt-1">We reply within 24 hours.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-sm bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1 uppercase tracking-wide">Live Chat</h3>
                                    <p className="text-gray-400">Available for Pro users</p>
                                    <p className="text-gray-500 text-sm mt-1">Mon-Fri, 9am - 5pm EST.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-sm bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1 uppercase tracking-wide">Office</h3>
                                    <p className="text-gray-400">123 Innovation Drive</p>
                                    <p className="text-gray-500 text-sm mt-1">San Francisco, CA 94105</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-card border border-gray-700/50 rounded-sm p-8 backdrop-blur-xl shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold font-mono text-neon-lime uppercase tracking-wider">First Name</label>
                                    <Input
                                        type="text"
                                        placeholder="Jane"
                                        className="bg-dark-bg border-gray-700 focus:border-neon-lime focus:ring-neon-lime/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold font-mono text-neon-lime uppercase tracking-wider">Last Name</label>
                                    <Input
                                        type="text"
                                        placeholder="Doe"
                                        className="bg-dark-bg border-gray-700 focus:border-neon-lime focus:ring-neon-lime/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold font-mono text-neon-lime uppercase tracking-wider">Email</label>
                                <Input
                                    type="email"
                                    placeholder="support@solosuccesss.com"
                                    className="bg-dark-bg border-gray-700 focus:border-neon-lime focus:ring-neon-lime/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold font-mono text-neon-lime uppercase tracking-wider">Message</label>
                                <Textarea
                                    rows={4}
                                    className="bg-dark-bg border-gray-700 focus:border-neon-lime focus:ring-neon-lime/20 min-h-[120px]"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                variant="lime"
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}

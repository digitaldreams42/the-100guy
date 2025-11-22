// app/about/page.js
import React from 'react';
import { Users, Mail, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';

// Mostly static content, can be a Server Component (no 'use client')

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">THE $100 GUY</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            My mission is simple: Demystify the process of making money online. No gurus, no schemes, just practical steps.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="space-y-12">
          {[
            { title: "The Journey", content: "It started in 2018. I had $100 in my bank account and a refusal to accept mediocrity. I spent that $100 on a domain name and hosting." },
            { title: "The Breakthrough", content: "After 6 months of failure, I sold my first template for $19. That notification changed everything. It wasn't about the money; it was about proof of concept." },
            { title: "Today", content: "I've helped over 5,000 students launch their own digital product businesses. We're building a community of creators who value freedom over titles." }
          ].map((section, idx) => (
            <div key={idx} className="border-l-4 border-yellow-400 pl-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-2xl font-bold mb-6">Connect With Me</h3>
          <div className="flex justify-center gap-6">
            <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Users size={24} />
            </button>
            <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Mail size={24} />
            </button>
            <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <DollarSign size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
    );
}
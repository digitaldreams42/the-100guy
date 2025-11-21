// app/about/page.js
import React from 'react';
import { Users, Mail, DollarSign, Target, TrendingUp, GraduationCap, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';

// Mostly static content, can be a Server Component (no 'use client')

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-32 h-32 bg-white text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl font-black">G</span>
          </div>
          <h1 className="text-5xl font-black mb-6">GEORGE K.</h1>
          <p className="text-xl max-w-2xl mx-auto">
            The $100 Guy • Author • Entrepreneur • Educator • Digital Product Strategist
          </p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto mt-4">
            I built a $100k business from scratch and now teach others how to do the same with practical, no-nonsense strategies.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gray-50 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">My Journey</h2>

          <div className="space-y-12">
            {[
              {
                title: "The Humble Beginning",
                content: "It started in 2018. I had $100 in my bank account and a refusal to accept mediocrity. I spent that $100 on a domain name and hosting, starting my journey into digital entrepreneurship.",
                icon: <DollarSign size={32} />,
                color: "from-red-400 to-pink-500"
              },
              {
                title: "The Breakthrough Moment",
                content: "After 6 months of failure, I sold my first template for $19. That notification changed everything. It wasn't about the money; it was about proof of concept.",
                icon: <TrendingUp size={32} />,
                color: "from-blue-400 to-cyan-500"
              },
              {
                title: "Growth & Scaling",
                content: "I refined my process, analyzed what worked, and systematized my approach. This led to consistent growth and the ability to help others.",
                icon: <Target size={32} />,
                color: "from-green-400 to-emerald-500"
              },
              {
                title: "Today's Impact",
                content: "I've helped over 5,000 students launch their own digital product businesses. We're building a community of creators who value freedom over titles.",
                icon: <Users size={32} />,
                color: "from-yellow-400 to-orange-500"
              }
            ].map((section, idx) => (
              <div key={idx} className="flex items-start">
                <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center mr-6 flex-shrink-0`}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
              Key Accomplishments
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">$100k+</span> business built from $100</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">5,000+</span> students transformed</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">100+</span> successful product launches</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">4.9★</span> average course rating</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GraduationCap className="w-6 h-6 mr-3 text-blue-500" />
              My Teaching Philosophy
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">No fluff</span> - Practical, actionable steps</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">Systematic approach</span> - Step-by-step processes</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">Real results</span> - Proven strategies that work</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <span className="text-gray-700"><span className="font-bold">Direct access</span> - Personal guidance from me</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Income?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who have used my blueprints to build profitable digital businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store" passHref>
              <Button variant="secondary" className="text-white bg-white/20 hover:bg-white/30 hover:scale-105 transition-transform">
                Browse My Courses
              </Button>
            </Link>
            <Link href="/contact" passHref>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600">
                Contact Me
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    );
}
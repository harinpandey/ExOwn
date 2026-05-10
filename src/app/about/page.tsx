import { ShoppingBag, Users, Shield, Star, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "About Us | ExOwn", description: "Learn about ExOwn — the student marketplace built for exchange, ownership, and circular commerce." };

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <img src="/exown-icon.png" alt="ExOwn Icon" className="h-4 w-4" /> Our Story
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Built by students, for students</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          ExOwn is the safest and smartest way for university students to buy, sell, and exchange second-hand items right on campus — fostering a circular economy built on trust.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Shield, title: "100% Verified Users", desc: "Every account is tied to a real university email, so you always know who you're dealing with." },
          { icon: Zap, title: "Campus-Fast Deals", desc: "Meet up in minutes — your buyer or seller is just a hostel block away." },
          { icon: Star, title: "Zero Commission", desc: "We never take a cut. Every rupee goes directly to you." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={24} className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12 text-center">
        <Users size={40} className="mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
          To make student life more sustainable and affordable by creating a trusted, community-driven marketplace where everything from textbooks to cycles can find a new owner. Exchange. Own. Repeat.
        </p>
        <Link href="/search" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors inline-block">
          Start Browsing
        </Link>
      </div>
    </div>
  );
}

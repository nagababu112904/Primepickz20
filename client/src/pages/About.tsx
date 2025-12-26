import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Users, Award, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f7ff] via-[#f3f1ff] to-[#ede9fe]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-[#7c3aed]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About PrimePickz</h1>

          <p className="text-gray-600 mb-8 text-lg">
            PrimePickz is your trusted marketplace for premium products. We curate the best selection
            of electronics, fashion, home goods, and more to bring you quality items at competitive prices.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-[#7c3aed] mb-4" />
                <h3 className="font-bold text-lg mb-2">Customer First</h3>
                <p className="text-gray-600">Your satisfaction is our top priority. We offer easy returns and 24/7 support.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-[#7c3aed] mb-4" />
                <h3 className="font-bold text-lg mb-2">Quality Products</h3>
                <p className="text-gray-600">Every product is carefully vetted to ensure the highest quality standards.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Globe className="w-8 h-8 text-[#7c3aed] mb-4" />
                <h3 className="font-bold text-lg mb-2">Fast Shipping</h3>
                <p className="text-gray-600">Free shipping on orders over $99. Quick delivery across the United States.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-[#7c3aed] mb-4" />
                <h3 className="font-bold text-lg mb-2">Trusted by Many</h3>
                <p className="text-gray-600">Thousands of happy customers trust PrimePickz for their shopping needs.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            We're on a mission to make quality products accessible to everyone. By partnering with top brands
            and manufacturers, we deliver exceptional value without compromising on quality.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <div className="text-gray-600 space-y-2">
            <p>📞 475-239-6334</p>
            <p>📧 support@primepickz.com</p>
            <p>📍 9121 Avalon Gates, Trumbull, CT 06611</p>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function SizeGuide() {
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
          <div className="flex items-center gap-3 mb-6">
            <Ruler className="w-8 h-8 text-[#7c3aed]" />
            <h1 className="text-3xl font-bold text-gray-900">Size Guide</h1>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Men's Clothing</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 font-semibold">Size</th>
                  <th className="py-3 px-4 font-semibold">Chest (in)</th>
                  <th className="py-3 px-4 font-semibold">Waist (in)</th>
                  <th className="py-3 px-4 font-semibold">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-3 px-4">S</td><td className="py-3 px-4">34-36</td><td className="py-3 px-4">28-30</td><td className="py-3 px-4">27</td></tr>
                <tr className="border-b"><td className="py-3 px-4">M</td><td className="py-3 px-4">38-40</td><td className="py-3 px-4">32-34</td><td className="py-3 px-4">28</td></tr>
                <tr className="border-b"><td className="py-3 px-4">L</td><td className="py-3 px-4">42-44</td><td className="py-3 px-4">36-38</td><td className="py-3 px-4">29</td></tr>
                <tr className="border-b"><td className="py-3 px-4">XL</td><td className="py-3 px-4">46-48</td><td className="py-3 px-4">40-42</td><td className="py-3 px-4">30</td></tr>
                <tr><td className="py-3 px-4">XXL</td><td className="py-3 px-4">50-52</td><td className="py-3 px-4">44-46</td><td className="py-3 px-4">31</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Women's Clothing</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 font-semibold">Size</th>
                  <th className="py-3 px-4 font-semibold">Bust (in)</th>
                  <th className="py-3 px-4 font-semibold">Waist (in)</th>
                  <th className="py-3 px-4 font-semibold">Hips (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-3 px-4">XS</td><td className="py-3 px-4">32-33</td><td className="py-3 px-4">24-25</td><td className="py-3 px-4">34-35</td></tr>
                <tr className="border-b"><td className="py-3 px-4">S</td><td className="py-3 px-4">34-35</td><td className="py-3 px-4">26-27</td><td className="py-3 px-4">36-37</td></tr>
                <tr className="border-b"><td className="py-3 px-4">M</td><td className="py-3 px-4">36-37</td><td className="py-3 px-4">28-29</td><td className="py-3 px-4">38-39</td></tr>
                <tr className="border-b"><td className="py-3 px-4">L</td><td className="py-3 px-4">38-39</td><td className="py-3 px-4">30-31</td><td className="py-3 px-4">40-41</td></tr>
                <tr><td className="py-3 px-4">XL</td><td className="py-3 px-4">40-42</td><td className="py-3 px-4">32-34</td><td className="py-3 px-4">42-44</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#7c3aed]/10 rounded-xl p-6">
            <h3 className="font-bold mb-2">💡 Measuring Tips</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Use a soft measuring tape for accurate measurements</li>
              <li>• Measure over undergarments or thin clothing</li>
              <li>• Keep the tape snug but not tight</li>
              <li>• When in doubt, size up for comfort</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

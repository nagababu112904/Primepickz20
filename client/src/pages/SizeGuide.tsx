import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function SizeGuide() {
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={0}
        wishlistCount={0}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="flex-1 max-w-screen-lg mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Size Guide</h1>
        <p className="text-muted-foreground mb-8">
          Find your perfect fit with our comprehensive size charts
        </p>

        <Tabs defaultValue="womens" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="womens">Women's</TabsTrigger>
            <TabsTrigger value="mens">Men's</TabsTrigger>
            <TabsTrigger value="kids">Kids</TabsTrigger>
          </TabsList>

          <TabsContent value="womens" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Women's Clothing</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Bust (in)</th>
                      <th className="text-left p-2">Waist (in)</th>
                      <th className="text-left p-2">Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2">XS</td><td className="p-2">32-33</td><td className="p-2">24-25</td><td className="p-2">34-35</td></tr>
                    <tr className="border-b"><td className="p-2">S</td><td className="p-2">34-35</td><td className="p-2">26-27</td><td className="p-2">36-37</td></tr>
                    <tr className="border-b"><td className="p-2">M</td><td className="p-2">36-37</td><td className="p-2">28-29</td><td className="p-2">38-39</td></tr>
                    <tr className="border-b"><td className="p-2">L</td><td className="p-2">38-39</td><td className="p-2">30-31</td><td className="p-2">40-41</td></tr>
                    <tr className="border-b"><td className="p-2">XL</td><td className="p-2">40-42</td><td className="p-2">32-34</td><td className="p-2">42-44</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Women's Footwear</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">US Size</th>
                      <th className="text-left p-2">UK Size</th>
                      <th className="text-left p-2">EU Size</th>
                      <th className="text-left p-2">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2">5</td><td className="p-2">3</td><td className="p-2">35-36</td><td className="p-2">22.0</td></tr>
                    <tr className="border-b"><td className="p-2">6</td><td className="p-2">4</td><td className="p-2">36-37</td><td className="p-2">23.0</td></tr>
                    <tr className="border-b"><td className="p-2">7</td><td className="p-2">5</td><td className="p-2">37-38</td><td className="p-2">24.0</td></tr>
                    <tr className="border-b"><td className="p-2">8</td><td className="p-2">6</td><td className="p-2">38-39</td><td className="p-2">25.0</td></tr>
                    <tr className="border-b"><td className="p-2">9</td><td className="p-2">7</td><td className="p-2">39-40</td><td className="p-2">26.0</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="mens" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Men's Clothing</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Chest (in)</th>
                      <th className="text-left p-2">Waist (in)</th>
                      <th className="text-left p-2">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2">S</td><td className="p-2">36-38</td><td className="p-2">28-30</td><td className="p-2">17.5</td></tr>
                    <tr className="border-b"><td className="p-2">M</td><td className="p-2">38-40</td><td className="p-2">30-32</td><td className="p-2">18</td></tr>
                    <tr className="border-b"><td className="p-2">L</td><td className="p-2">40-42</td><td className="p-2">32-34</td><td className="p-2">18.5</td></tr>
                    <tr className="border-b"><td className="p-2">XL</td><td className="p-2">42-44</td><td className="p-2">34-36</td><td className="p-2">19</td></tr>
                    <tr className="border-b"><td className="p-2">XXL</td><td className="p-2">44-46</td><td className="p-2">36-38</td><td className="p-2">19.5</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Men's Footwear</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">US Size</th>
                      <th className="text-left p-2">UK Size</th>
                      <th className="text-left p-2">EU Size</th>
                      <th className="text-left p-2">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2">7</td><td className="p-2">6</td><td className="p-2">40</td><td className="p-2">25.0</td></tr>
                    <tr className="border-b"><td className="p-2">8</td><td className="p-2">7</td><td className="p-2">41</td><td className="p-2">26.0</td></tr>
                    <tr className="border-b"><td className="p-2">9</td><td className="p-2">8</td><td className="p-2">42</td><td className="p-2">27.0</td></tr>
                    <tr className="border-b"><td className="p-2">10</td><td className="p-2">9</td><td className="p-2">43</td><td className="p-2">28.0</td></tr>
                    <tr className="border-b"><td className="p-2">11</td><td className="p-2">10</td><td className="p-2">44</td><td className="p-2">29.0</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="kids" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Kids Clothing (Age 2-12)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Age</th>
                      <th className="text-left p-2">Height (in)</th>
                      <th className="text-left p-2">Chest (in)</th>
                      <th className="text-left p-2">Waist (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2">2-3 Y</td><td className="p-2">35-38</td><td className="p-2">20-21</td><td className="p-2">20-21</td></tr>
                    <tr className="border-b"><td className="p-2">4-5 Y</td><td className="p-2">39-43</td><td className="p-2">22-23</td><td className="p-2">21-22</td></tr>
                    <tr className="border-b"><td className="p-2">6-7 Y</td><td className="p-2">44-48</td><td className="p-2">24-25</td><td className="p-2">22-23</td></tr>
                    <tr className="border-b"><td className="p-2">8-9 Y</td><td className="p-2">49-52</td><td className="p-2">26-27</td><td className="p-2">23-24</td></tr>
                    <tr className="border-b"><td className="p-2">10-12 Y</td><td className="p-2">53-58</td><td className="p-2">28-30</td><td className="p-2">24-26</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">How to Measure</h3>
          <div className="space-y-3 text-muted-foreground">
            <p><strong>Bust/Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
            <p><strong>Waist:</strong> Measure around the narrowest part of your waist, typically just above the navel.</p>
            <p><strong>Hips:</strong> Stand with feet together and measure around the fullest part of your hips.</p>
            <p><strong>Foot Length:</strong> Stand on a piece of paper and mark your heel and longest toe. Measure the distance.</p>
          </div>
        </Card>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}

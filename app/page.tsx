"use client";

import { useState } from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <CategoryFilter onCategoryChange={setSelectedCategory} />
        <ProductGrid selectedCategory={selectedCategory} />
      </main>
      <Footer />
    </div>
  );
}

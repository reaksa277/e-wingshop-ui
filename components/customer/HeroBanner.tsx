'use client';

import { useState } from 'react';
import { Leaf, ChevronLeft, ChevronRight } from 'lucide-react';

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      tag: 'Weekend Discount',
      title: 'Get the best quality products at the lowest prices',
      description: 'We have prepared special discount for you on organic breakfast products.',
      currentPrice: '$21.67',
      originalPrice: '$29.55',
      image: '🥣',
      product: 'Organic Granola Box',
    },
    {
      tag: 'Fresh Arrival',
      title: 'Farm-fresh fruits delivered to your doorstep',
      description:
        'Hand-picked organic fruits from local farms, available at special introductory prices.',
      currentPrice: '$15.99',
      originalPrice: '$22.99',
      image: '🍓',
      product: 'Mixed Berry Collection',
    },
    {
      tag: 'Limited Offer',
      title: 'Premium dairy products for your family',
      description: '100% organic milk and cheese from grass-fed cows, now at exclusive discounts.',
      currentPrice: '$18.50',
      originalPrice: '$25.00',
      image: '🧀',
      product: 'Artisan Cheese Set',
    },
    {
      tag: 'Best Seller',
      title: 'Healthy snacks for your daily routine',
      description:
        'Nutritious and delicious snacks made with natural ingredients, perfect for any time.',
      currentPrice: '$12.99',
      originalPrice: '$17.99',
      image: '🥜',
      product: 'Mixed Nuts Premium Pack',
    },
    {
      tag: 'New Launch',
      title: 'Cold-pressed juices for a fresh start',
      description: '100% pure fruit and vegetable juices with no added sugar or preservatives.',
      currentPrice: '$24.99',
      originalPrice: '$32.99',
      image: '🧃',
      product: 'Juice Detox Bundle',
    },
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <section className="mx-8 overflow-hidden rounded-2xl">
      <div
        className="relative min-h-[320px] overflow-hidden bg-cream"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(26,107,47,0.03) 25%, transparent 25%),
            linear-gradient(225deg, rgba(26,107,47,0.03) 25%, transparent 25%),
            linear-gradient(45deg, rgba(26,107,47,0.03) 25%, transparent 25%),
            linear-gradient(315deg, rgba(26,107,47,0.03) 25%, transparent 25%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
        }}
      >
        {/* Background Decorative Circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-light opacity-50 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-brand-light opacity-30 blur-2xl" />

        <div className="relative grid grid-cols-2 items-center gap-8 px-8 py-12 md:px-12">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">
            {/* Tag Pill */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
              <Leaf className="h-3 w-3" />
              {currentSlideData.tag}
            </span>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold leading-tight text-gray-900 md:text-[42px]">
              {currentSlideData.title}
            </h1>

            {/* Description */}
            <p className="font-sans text-sm leading-relaxed text-gray-600 md:text-base">
              {currentSlideData.description}
            </p>

            {/* Price Row */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-brand">{currentSlideData.currentPrice}</span>
              <span className="text-base text-gray-400 line-through">
                {currentSlideData.originalPrice}
              </span>
            </div>

            {/* CTA Button */}
            <button className="group flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-dark hover:shadow-green">
              Shop Now
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative flex items-center justify-center">
            {/* Product Image */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-light to-transparent opacity-50 blur-xl transition-opacity group-hover:opacity-70" />
              <span
                className="relative z-10 block text-9xl transition-transform duration-500 group-hover:scale-110"
                role="img"
                aria-label={currentSlideData.product}
              >
                {currentSlideData.image}
              </span>
            </div>

            {/* Organic Badge */}
            <div className="absolute -right-2 top-0 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand shadow-card">
              <Leaf className="h-3.5 w-3.5" />
              100% Organic
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-card transition-all hover:bg-brand hover:text-white hover:shadow-green backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-card transition-all hover:bg-brand hover:text-white hover:shadow-green backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots Carousel Indicator */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-brand' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Button } from '@/components/ui/button';

export function HeroBanner() {
  return (
    <section className="w-full bg-[#1e5c30] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left Content */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="mb-2 inline-flex items-center rounded-full bg-[#f5c518] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1a1a1a]">
              Best Sale
            </span>
            <h2 className="font-nunito-sans text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              Fresh Groceries
              <br />
              <span className="text-[#f5c518]">Free Delivery</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/90 md:text-base">
              Order now and get fresh products delivered to your doorstep within 25 minutes.
            </p>
            <Button className="mt-5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#1a6b2f] hover:bg-gray-100">
              Shop Now
            </Button>
          </div>

          {/* Right Content - Promo Cards */}
          <div className="flex gap-4">
            <div className="hidden rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:block md:p-6">
              <p className="text-xs text-white/80">Use Code</p>
              <p className="font-nunito-sans text-xl font-bold text-[#f5c518] md:text-2xl">
                WELCOME20
              </p>
              <p className="mt-1 text-xs text-white/70">Get 20% OFF</p>
            </div>
            <div className="hidden rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:block md:p-6">
              <p className="text-xs text-white/80">Delivery</p>
              <p className="font-nunito-sans text-xl font-bold text-white md:text-2xl">25 min</p>
              <p className="mt-1 text-xs text-white/70">Fast Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

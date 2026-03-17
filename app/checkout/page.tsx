"use client";

import { useState } from "react";
import { Check, MapPin, CreditCard, DollarSign, Smartphone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PromoCodeInput } from "@/components/ui/PromoCodeInput";
import { cn } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const SAMPLE_CART: CartItem[] = [
  { id: "1", name: "Wireless Headphones", price: 79.99, quantity: 1, image: "/products/headphones.jpg" },
  { id: "2", name: "Smart Watch Pro", price: 199.99, quantity: 1, image: "/products/watch.jpg" },
];

const BRANCHES = [
  { id: "1", name: "Downtown Branch", address: "123 Main Street, City Center", distance: "1.2 km" },
  { id: "2", name: "Westside Mall", address: "456 Shopping Ave, West District", distance: "3.5 km" },
  { id: "3", name: "North Point", address: "789 North Road, Uptown", distance: "5.1 km" },
];

const STEPS = [
  { id: 1, name: "Cart" },
  { id: 2, name: "Delivery" },
  { id: 3, name: "Payment" },
  { id: 4, name: "Confirm" },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod" | "digital">("card");
  const [saveCard, setSaveCard] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    deliveryNotes: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
  });

  const subtotal = SAMPLE_CART.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handlePlaceOrder = () => {
    // Handle order placement
    console.log("Order placed!", { formData, selectedBranch, paymentMethod });
    setCurrentStep(4);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 transition-all",
                      currentStep >= step.id
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <span className="text-sm md:text-base font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs md:text-sm font-medium",
                      currentStep >= step.id ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 md:mx-4 h-0.5 w-8 md:w-16 transition-all",
                      currentStep > step.id ? "bg-brand" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
          {/* LEFT - Form */}
          <div className="space-y-6">
            {/* Step 2 - Delivery Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Details</CardTitle>
                  <CardDescription>Enter your shipping information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name & Phone */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">
                        Full name*
                      </label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone number*
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Lines */}
                  <div className="space-y-2">
                    <label htmlFor="address1" className="text-sm font-medium">
                      Address line 1*
                    </label>
                    <Input
                      id="address1"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address2" className="text-sm font-medium">
                      Address line 2
                    </label>
                    <Input
                      id="address2"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  {/* City, State, Postal Code */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        City*
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium">
                        State
                      </label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="postalCode" className="text-sm font-medium">
                        Postal code*
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>

                  {/* Branch Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Nearest Branch (for pickup)</label>
                    <div className="space-y-2">
                      {BRANCHES.map((branch) => (
                        <label
                          key={branch.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all",
                            selectedBranch === branch.id
                              ? "border-brand bg-brand/5"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          <input
                            type="radio"
                            name="branch"
                            value={branch.id}
                            checked={selectedBranch === branch.id}
                            onChange={() => setSelectedBranch(branch.id)}
                            className="mt-1 h-4 w-4 accent-brand"
                          />
                          <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", selectedBranch === branch.id ? "text-brand" : "text-muted-foreground")} />
                          <div className="flex-1">
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-sm text-muted-foreground">{branch.address}</p>
                            <p className="text-xs text-muted-foreground">{branch.distance} away</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div className="space-y-2">
                    <label htmlFor="deliveryNotes" className="text-sm font-medium">
                      Delivery notes
                    </label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 resize-none"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back to Cart
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 3 - Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <CardDescription>Choose how you want to pay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Method Radio Group */}
                  <div className="space-y-2">
                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                        paymentMethod === "card"
                          ? "border-brand bg-brand/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="h-4 w-4 accent-brand"
                        />
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-6 w-9 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">V</div>
                        <div className="h-6 w-9 rounded bg-red-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                      </div>
                    </label>

                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                        paymentMethod === "cod"
                          ? "border-brand bg-brand/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="h-4 w-4 accent-brand"
                        />
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </div>
                    </label>

                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                        paymentMethod === "digital"
                          ? "border-brand bg-brand/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="digital"
                          checked={paymentMethod === "digital"}
                          onChange={() => setPaymentMethod("digital")}
                          className="h-4 w-4 accent-brand"
                        />
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Apple Pay / Google Pay</p>
                          <p className="text-xs text-muted-foreground">Quick and secure digital wallet</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 animate-fade-in">
                      <div className="space-y-2">
                        <label htmlFor="cardNumber" className="text-sm font-medium">
                          Card number
                        </label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="cardExpiry" className="text-sm font-medium">
                            Expiry date
                          </label>
                          <Input
                            id="cardExpiry"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="cardCvv" className="text-sm font-medium">
                            CVV
                          </label>
                          <Input
                            id="cardCvv"
                            name="cardCvv"
                            value={formData.cardCvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="cardName" className="text-sm font-medium">
                          Name on card
                        </label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="h-4 w-4 accent-brand"
                        />
                        <span className="text-sm text-muted-foreground">Save this card for future purchases</span>
                      </label>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back to Delivery
                  </Button>
                  <Button onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 4 - Confirmation */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Order Confirmed!</CardTitle>
                      <CardDescription>Thank you for your purchase</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Your order has been placed successfully. You will receive a confirmation email shortly.
                  </p>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">Order Number: #EW-{Date.now().toString().slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">Estimated delivery: 3-5 business days</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => window.location.href = "/"}>
                    Continue Shopping
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* RIGHT - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-8">
            <Card size="sm" className="border-2">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini Cart Recap */}
                <div className="space-y-3">
                  {SAMPLE_CART.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <PromoCodeInput className="border-t pt-4" />

                {/* Price Breakdown */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-brand">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order CTA (only on step 2-3) */}
                {currentStep === 2 && (
                  <Button className="w-full" size="lg" onClick={handleNextStep}>
                    Continue to Payment
                  </Button>
                )}

                {/* SSL Secure Note */}
                <div className="flex items-center justify-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>SSL secure checkout</span>
                </div>
                <div className="flex items-center justify-center gap-2 border-t pt-3">
                  <div className="h-6 w-10 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">V</div>
                  <div className="h-6 w-10 rounded bg-red-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                  <div className="h-6 w-10 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                  <div className="h-6 w-10 rounded bg-green-600 flex items-center justify-center text-white text-xs font-bold">P</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

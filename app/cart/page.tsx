'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const SAMPLE_CART: CartItem[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    quantity: 1,
    image: '/products/headphones.jpg',
  },
  { id: '2', name: 'Smart Watch Pro', price: 199.99, quantity: 1, image: '/products/watch.jpg' },
];

export default function CartPage() {
  const subtotal = SAMPLE_CART.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SAMPLE_CART.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold">Subtotal</span>
              <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => (window.location.href = '/checkout')}>
                Proceed to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

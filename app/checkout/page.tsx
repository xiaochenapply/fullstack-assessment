'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutForm } from '@/components/checkout-form';
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [showForm, setShowForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (items.length === 0 && !showForm) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  // ---------- Checkout view (form + order details) ----------
  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Product Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            <CheckoutForm onSuccess={() => { clearCart(); setOrderPlaced(true); }} />
          </div>

          {/* Right: Order Details + Summary */}
          {!orderPlaced && <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Order Details ({totalItems})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.stacklineSku}
                      className="flex gap-3 items-start"
                    >
                      <div className="relative h-16 w-16 shrink-0 bg-muted rounded-lg overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums">
                          ${(item.retailPrice * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex gap-1 mt-1 justify-end">
                          <Link href={`/product/${item.stacklineSku}`}>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.stacklineSku)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Delivery &amp; Handling
                    </span>
                    <span className="font-medium tabular-nums">$7.50</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="tabular-nums">
                      ${(totalPrice + 7.5).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>}
        </div>
      </div>
    );
  }

  // ---------- Cart view ----------
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.stacklineSku} className="flex flex-row items-center p-4 gap-4">
              <div className="relative h-20 w-20 shrink-0 bg-muted rounded-lg overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.stacklineSku}`}
                  className="text-sm font-medium hover:underline line-clamp-2"
                >
                  {item.title}
                </Link>
                <p className="text-sm font-bold mt-1">
                  ${item.retailPrice.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateQuantity(item.stacklineSku, item.quantity - 1)
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium tabular-nums">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateQuantity(item.stacklineSku, item.quantity + 1)
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-sm font-bold w-20 text-right tabular-nums">
                ${(item.retailPrice * item.quantity).toFixed(2)}
              </p>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeItem(item.stacklineSku)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Items ({totalItems})
                </span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowForm(true)}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
              <Link href="/" className="w-full">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

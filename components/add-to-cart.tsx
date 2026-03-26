'use client';

import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface AddToCartProps {
  product: {
    stacklineSku: string;
    title: string;
    retailPrice: number;
    imageUrl: string;
  };
  variant?: 'compact' | 'full' | 'product';
}

export function AddToCart({ product, variant = 'compact' }: AddToCartProps) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const cartItem = items.find(
    (item) => item.stacklineSku === product.stacklineSku
  );
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.stacklineSku, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.stacklineSku, quantity - 1);
  };

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={handleDecrement}
            disabled={quantity === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-medium tabular-nums">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={handleIncrement}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleAdd} className="flex-1">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    );
  }

  // Product page variant — constrained width, polished layout
  if (variant === 'product') {
    if (quantity > 0) {
      return (
        <div className="flex items-center border rounded-lg bg-muted/50 w-fit h-9">
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-9 rounded-l-lg rounded-r-none"
            onClick={handleDecrement}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-9 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-9 rounded-r-lg rounded-l-none"
            onClick={handleIncrement}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    }

    return (
      <Button className="w-fit h-9 px-6" onClick={handleAdd}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    );
  }

  // Compact variant
  if (quantity > 0) {
    return (
      <div
        className="flex items-center justify-between w-full h-8 border rounded-md"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-7"
          onClick={handleDecrement}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium tabular-nums">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-7"
          onClick={handleIncrement}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="default" size="sm" className="w-full h-8" onClick={handleAdd}>
      <ShoppingCart className="h-3.5 w-3.5" />
    </Button>
  );
}

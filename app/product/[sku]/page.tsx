'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    stacklineSku: string;
    title: string;
    categoryName: string;
    subCategoryName: string;
    imageUrls: string[];
    featureBullets: string[];
    retailerSku: string;
    retailPrice: number;
}

export default function ProductPage() {
    const params = useParams();
    const sku = params.sku as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!sku) return;

        setLoading(true);
        setError(null);
        setSelectedImage(0);
        fetch(`/api/products/${sku}`)
            .then((res) => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Failed to load product');
                setLoading(false);
            });
    }, [sku]);

    // Fetch related products
    useEffect(() => {
        if (!product) return;

        // Try subcategory first
        const subCatParams = new URLSearchParams({
            subCategory: product.subCategoryName,
            limit: '5',
        });
        fetch(`/api/products?${subCatParams}`)
            .then((res) => res.json())
            .then((data) => {
                const filtered = (data.products as Product[]).filter(
                    (p) => p.stacklineSku !== product.stacklineSku
                );
                if (filtered.length > 0) {
                    setRelatedProducts(filtered);
                } else {
                    // Fallback to category
                    const catParams = new URLSearchParams({
                        category: product.categoryName,
                        limit: '5',
                    });
                    fetch(`/api/products?${catParams}`)
                        .then((res) => res.json())
                        .then((data) => {
                            setRelatedProducts(
                                (data.products as Product[]).filter(
                                    (p) => p.stacklineSku !== product.stacklineSku
                                )
                            );
                        })
                        .catch(() => { });
                }
            })
            .catch(() => { });
    }, [product]);

    const handlePrevImage = () => {
        if (!product) return;
        setSelectedImage((prev) =>
            prev === 0 ? product.imageUrls.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        if (!product) return;
        setSelectedImage((prev) =>
            prev === product.imageUrls.length - 1 ? 0 : prev + 1
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <p className="text-center text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                    <Card className="p-8">
                        <p className="text-center text-destructive mb-4">
                            {error || 'Product not found'}
                        </p>
                        <div className="text-center">
                            <Link href="/">
                                <Button variant="outline">Browse Products</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Link href="/">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative h-96 w-full bg-muted">
                                    {product.imageUrls[selectedImage] ? (
                                        <Image
                                            src={product.imageUrls[selectedImage]}
                                            alt={product.title}
                                            fill
                                            className="object-contain p-8"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                            No image available
                                        </div>
                                    )}

                                    {product.imageUrls.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-md transition-colors"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-md transition-colors"
                                                aria-label="Next image"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {product.imageUrls.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.imageUrls.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setSelectedImage(idx)}
                                        className={`relative h-20 border-2 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md ${selectedImage === idx
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-muted hover:border-primary/50'
                                            }`}
                                    >
                                        <Image
                                            src={url}
                                            alt={`${product.title} - Image ${idx + 1}`}
                                            fill
                                            className="object-contain p-2"
                                            sizes="100px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex gap-2 mb-2">
                                <Link href={`/?category=${encodeURIComponent(product.categoryName)}`}>
                                    <Badge variant="secondary" className="cursor-pointer hover:opacity-80">{product.categoryName}</Badge>
                                </Link>
                                <Link href={`/?category=${encodeURIComponent(product.categoryName)}&subCategory=${encodeURIComponent(product.subCategoryName)}`}>
                                    <Badge variant="outline" className="cursor-pointer hover:opacity-80">{product.subCategoryName}</Badge>
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                            <p className="text-2xl font-bold text-primary mb-2">
                                ${product.retailPrice.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">SKU: {product.retailerSku}</p>
                        </div>

                        {product.featureBullets && product.featureBullets.length > 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <h2 className="text-lg font-semibold mb-3">Features</h2>
                                    <ul className="space-y-2">
                                        {product.featureBullets.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {relatedProducts.map((related) => (
                                <Link key={related.stacklineSku} href={`/product/${related.stacklineSku}`}>
                                    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardContent className="p-0">
                                            <div className="relative h-36 w-full overflow-hidden rounded-t-lg bg-muted">
                                                {related.imageUrls[0] ? (
                                                    <Image
                                                        src={related.imageUrls[0]}
                                                        alt={related.title}
                                                        fill
                                                        className="object-contain p-3"
                                                        sizes="(max-width: 768px) 50vw, 20vw"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex-1 flex flex-col items-start pt-3 pb-3">
                                            <p className="text-sm line-clamp-2 mb-1">{related.title}</p>
                                            <p className="text-sm font-bold mt-auto">${related.retailPrice.toFixed(2)}</p>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

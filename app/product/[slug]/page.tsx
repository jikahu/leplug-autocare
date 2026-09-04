import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { StockStatus } from "@/lib/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import { getProductBySlug, products } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getReviewsByProductId } from "@/lib/data/reviews";
import { getRelatedProducts } from "@/lib/utils/related-products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const STOCK_AVAILABILITY: Record<StockStatus, string> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — LePlug Autocare`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.category);
  const reviews = getReviewsByProductId(product.id);
  const related = getRelatedProducts(product, products);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.price,
      availability: STOCK_AVAILABILITY[product.stock],
    },
    ...(product.rating !== undefined && product.reviewCount !== undefined
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <ProductGallery images={product.images} category={product.category} productName={product.name} />
          <ProductPurchasePanel product={product} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <section>
            <h2 className="font-heading text-xl font-bold text-tarmac">Description</h2>
            <p className="mt-3 text-sm text-tarmac/80">{product.description}</p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-tarmac">Key Features</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-tarmac/80">
              {product.keyFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        </div>

        {product.compatibleMakes && product.compatibleMakes.length > 0 && (
          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold text-tarmac">Compatible Vehicle Makes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.compatibleMakes.map((make) => (
                <span
                  key={make}
                  className="rounded-full border border-steel/40 px-3 py-1 text-sm text-tarmac"
                >
                  {make}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-tarmac">Reviews</h2>
          <div className="mt-4">
            <ProductReviews productId={product.id} initialReviews={reviews} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-bold text-tarmac">Related Products</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}

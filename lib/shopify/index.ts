// lib/shopify/index.ts  — Mock mode (no Shopify needed)
import type {
  Cart,
  Collection,
  Image,
  Menu,
  Page,
  Product
} from './types';
import { cacheTag, cacheLife } from '../cache';

export const SHOPIFY_DISABLED = true;

// simple gray SVG so we don't depend on remote images
const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>" +
  "<rect width='100%' height='100%' fill='%23eeeeee'/>" +
  "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' " +
  "font-size='48' fill='%23999999'>Mock</text></svg>";

const img = (alt = 'Placeholder'): Image => ({
  url: PLACEHOLDER_SVG,
  altText: alt,
  width: 1200,
  height: 1200
});

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'mock-hoodie',
    availableForSale: true,
    title: 'Mock Hoodie',
    description: 'Soft, comfy, totally not real.',
    descriptionHtml: '<p>Soft, comfy, totally not real.</p>',
    options: [],
    priceRange: {
      maxVariantPrice: { amount: '59.00', currencyCode: 'USD' },
      minVariantPrice: { amount: '39.00', currencyCode: 'USD' }
    },
    variants: [],
    featuredImage: img('Mock Hoodie'),
    images: [img('Mock Hoodie')],
    seo: { title: 'Mock Hoodie', description: 'A nice hoodie' },
    tags: ['mock'],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'mock-tshirt',
    availableForSale: true,
    title: 'Mock T-Shirt',
    description: 'Crisp cotton tee (in your imagination).',
    descriptionHtml: '<p>Crisp cotton tee (in your imagination).</p>',
    options: [],
    priceRange: {
      maxVariantPrice: { amount: '29.00', currencyCode: 'USD' },
      minVariantPrice: { amount: '19.00', currencyCode: 'USD' }
    },
    variants: [],
    featuredImage: img('Mock T-Shirt'),
    images: [img('Mock T-Shirt')],
    seo: { title: 'Mock T-Shirt', description: 'A nice tee' },
    tags: ['mock'],
    updatedAt: new Date().toISOString()
  }
];

const MOCK_COLLECTIONS: Collection[] = [
  {
    handle: '',
    title: 'All',
    description: 'All products',
    seo: { title: 'All', description: 'All products' },
    path: '/search',
    updatedAt: new Date().toISOString()
  },
  {
    handle: 'new',
    title: 'New',
    description: 'New arrivals',
    seo: { title: 'New', description: 'New arrivals' },
    path: '/search/new',
    updatedAt: new Date().toISOString()
  }
];

export async function getCollections(): Promise<Collection[]> {
  'use cache';
  cacheTag('collections');
  cacheLife('days');
  return MOCK_COLLECTIONS;
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  'use cache';
  cacheTag('collections');
  cacheLife('days');
  return MOCK_COLLECTIONS.find(c => c.handle === handle) ?? MOCK_COLLECTIONS[0];
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag('collections', 'products');
  cacheLife('days');
  // just return everything for the demo
  return MOCK_PRODUCTS;
}

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag('products');
  cacheLife('days');
  // optionally filter by a super simple query
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    return MOCK_PRODUCTS.filter(p => (p.title + ' ' + p.description).toLowerCase().includes(q));
  }
  return MOCK_PRODUCTS;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  'use cache';
  cacheTag('products');
  cacheLife('days');
  return MOCK_PRODUCTS.find(p => p.handle === handle);
}

export async function getProductRecommendations(_productId: string): Promise<Product[]> {
  'use cache';
  cacheTag('products');
  cacheLife('days');
  return MOCK_PRODUCTS;
}

export async function getMenu(_handle: string): Promise<Menu[]> {
  'use cache';
  cacheTag('collections');
  cacheLife('days');
  return [
    { title: 'Home', path: '/' },
    { title: 'Competitions', path: '/competitions' },
    { title: 'Search', path: '/search' }
  ];
}

export async function getPage(_handle: string): Promise<Page> {
  return {
    id: 'page-1',
    title: 'About',
    handle: 'about',
    body: 'This is a mock page.',
    bodySummary: 'This is a mock page.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: { title: 'About', description: 'About this mock site' }
  };
}

export async function getPages(): Promise<Page[]> {
  return [await getPage('about')];
}

/** Cart — simplest safe stubs so cart UI won’t crash */
const EMPTY_CART: Cart = {
  id: 'mock-cart',
  checkoutUrl: '#',
  cost: {
    subtotalAmount: { amount: '0.00', currencyCode: 'USD' },
    totalAmount: { amount: '0.00', currencyCode: 'USD' },
    totalTaxAmount: { amount: '0.00', currencyCode: 'USD' }
  },
  lines: []
};

export async function createCart(): Promise<Cart> { return EMPTY_CART; }
export async function getCart(): Promise<Cart | undefined> { return EMPTY_CART; }
export async function addToCart(): Promise<Cart> { return EMPTY_CART; }
export async function updateCart(): Promise<Cart> { return EMPTY_CART; }
export async function removeFromCart(): Promise<Cart> { return EMPTY_CART; }
export async function revalidate(): Promise<any> { return { status: 200 }; }

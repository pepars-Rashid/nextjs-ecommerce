"use server"
import { db } from './db.js';
import {
	products,
	productImages,
	categories,
	productCategories,
} from './schema.js';

// Helper to slugify category names for the categories.slug field
function slugify(input: string): string {
	return input
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

async function seed() {
	// 1) Users
	const userData = [
		{
			email: 'user1@example.com',
			passwordHash: 'hashed_password_1',
			name: 'John Doe',
			role: 'user',
		},
		{
			email: 'user2@example.com',
			passwordHash: 'hashed_password_2',
			name: 'Jane Smith',
			role: 'user',
		},
	];

	// Best-effort idempotency for users based on unique email
	// await db
	// 	.insert(users)
	// 	.values(userData)
	// 	.onConflictDoNothing({ target: [users.email] });

	// 2) Products (aligned with src/components/Shop/shopData.ts)
	const productSeed = [
		{
			title: 'Havit HV-G69 USB Gamepad',
			price: '59.00',
			discountedPrice: '29.00',
			stock: 100,
			reviewsCount: 15,
			avgRating: '4.50',
			description: 'Havit HV-G69 wired USB gamepad controller for PC.',
			imgs: {
				thumbnails: [
					'/images/products/product-1-sm-1.png',
					'/images/products/product-1-sm-2.png',
				],
				previews: [
					'/images/products/product-1-bg-1.png',
					'/images/products/product-1-bg-2.png',
				],
			},
		},
		{
			title: 'iPhone 14 Plus , 6/128GB',
			price: '899.00',
			discountedPrice: '99.00',
			stock: 50,
			reviewsCount: 5,
			avgRating: '4.60',
			description: 'Apple iPhone 14 Plus with 6GB RAM and 128GB storage.',
			imgs: {
				thumbnails: [
					'/images/products/product-2-sm-1.png',
					'/images/products/product-2-sm-2.png',
				],
				previews: [
					'/images/products/product-2-bg-1.png',
					'/images/products/product-2-bg-2.png',
				],
			},
		},
		{
			title: 'Apple iMac M1 24-inch 2021',
			price: '59.00',
			discountedPrice: '29.00',
			stock: 20,
			reviewsCount: 5,
			avgRating: '4.40',
			description: 'Apple iMac M1 24-inch (2021) all-in-one desktop computer.',
			imgs: {
				thumbnails: [
					'/images/products/product-3-sm-1.png',
					'/images/products/product-3-sm-2.png',
				],
				previews: [
					'/images/products/product-3-bg-1.png',
					'/images/products/product-3-bg-2.png',
				],
			},
		},
		{
			title: 'MacBook Air M1 chip, 8/256GB',
			price: '59.00',
			discountedPrice: '29.00',
			stock: 35,
			reviewsCount: 6,
			avgRating: '4.70',
			description: 'Apple MacBook Air with M1 chip, 8GB RAM and 256GB SSD.',
			imgs: {
				thumbnails: [
					'/images/products/product-4-sm-1.png',
					'/images/products/product-4-sm-2.png',
				],
				previews: [
					'/images/products/product-4-bg-1.png',
					'/images/products/product-4-bg-2.png',
				],
			},
		},
		{
			title: 'Apple Watch Ultra',
			price: '99.00',
			discountedPrice: '29.00',
			stock: 40,
			reviewsCount: 3,
			avgRating: '4.20',
			description: 'Apple Watch Ultra wearable smartwatch.',
			imgs: {
				thumbnails: [
					'/images/products/product-5-sm-1.png',
					'/images/products/product-5-sm-2.png',
				],
				previews: [
					'/images/products/product-5-bg-1.png',
					'/images/products/product-5-bg-2.png',
				],
			},
		},
		{
			title: 'Logitech MX Master 3 Mouse',
			price: '59.00',
			discountedPrice: '29.00',
			stock: 75,
			reviewsCount: 15,
			avgRating: '4.80',
			description: 'Logitech MX Master 3 advanced wireless mouse.',
			imgs: {
				thumbnails: [
					'/images/products/product-6-sm-1.png',
					'/images/products/product-6-sm-2.png',
				],
				previews: [
					'/images/products/product-6-bg-1.png',
					'/images/products/product-6-bg-2.png',
				],
			},
		},
		{
			title: 'Apple iPad Air 5th Gen - 64GB',
			price: '59.00',
			discountedPrice: '29.00',
			stock: 60,
			reviewsCount: 15,
			avgRating: '4.30',
			description: 'Apple iPad Air 5th Generation with 64GB storage.',
			imgs: {
				thumbnails: [
					'/images/products/product-7-sm-1.png',
					'/images/products/product-7-sm-2.png',
				],
				previews: [
					'/images/products/product-7-bg-1.png',
					'/images/products/product-7-bg-2.png',
				],
			},
		},
		{
			title: 'Asus RT Dual Band Router',
			price: '59.00',
			discountedPrice: '29.00',
			stock: 90,
			reviewsCount: 15,
			avgRating: '4.10',
			description: 'ASUS RT series dual band wireless router.',
			imgs: {
				thumbnails: [
					'/images/products/product-8-sm-1.png',
					'/images/products/product-8-sm-2.png',
				],
				previews: [
					'/images/products/product-8-bg-1.png',
					'/images/products/product-8-bg-2.png',
				],
			},
		},
	];

	const insertedProducts = await db
		.insert(products)
		.values(
			productSeed.map((p) => ({
				title: p.title,
				price: p.price,
				discountedPrice: p.discountedPrice,
				stock: p.stock,
				reviewsCount: p.reviewsCount,
				avgRating: p.avgRating,
				description: p.description,
			}))
		)
		.returning();

	// 3) Product Images (thumbnails + previews)
	for (let i = 0; i < insertedProducts.length; i += 1) {
		const product = insertedProducts[i];
		const seed = productSeed[i];

		const imageRows: Array<{
			productId: number;
			url: string;
			kind: 'thumbnail' | 'preview';
			sortOrder: number;
		}> = [];

		seed.imgs.thumbnails.forEach((url, idx) => {
			imageRows.push({
				productId: product.id,
				url,
				kind: 'thumbnail',
				sortOrder: idx,
			});
		});

		seed.imgs.previews.forEach((url, idx) => {
			imageRows.push({
				productId: product.id,
				url,
				kind: 'preview',
				sortOrder: idx,
			});
		});

		await db.insert(productImages).values(imageRows);
	}

	// 4) Categories (from Home categories + ShopWithSidebar list)
	const categoryData = [
		// Home/Categories with images
		{ name: 'Televisions', imgUrl: '/images/categories/categories-01.png' },
		{ name: 'Laptop & PC', imgUrl: '/images/categories/categories-02.png' },
		{ name: 'Mobile & Tablets', imgUrl: '/images/categories/categories-03.png' },
		{ name: 'Games & Videos', imgUrl: '/images/categories/categories-04.png' },
		{ name: 'Home Appliances', imgUrl: '/images/categories/categories-05.png' },
		{ name: 'Health & Sports', imgUrl: '/images/categories/categories-06.png' },
		{ name: 'Watches', imgUrl: '/images/categories/categories-07.png' },
		// Additional categories from ShopWithSidebar (using default image)
		{ name: 'Desktop', imgUrl: '/images/categories/categories-01.png' },
		{ name: 'Laptop', imgUrl: '/images/categories/categories-02.png' },
		{ name: 'Monitor', imgUrl: '/images/categories/categories-01.png' },
		{ name: 'UPS', imgUrl: '/images/categories/categories-05.png' },
		{ name: 'Phone', imgUrl: '/images/categories/categories-03.png' },
		{ name: 'Watch', imgUrl: '/images/categories/categories-07.png' },
	];

	// Remove duplicates based on name
	const uniqueCategories = categoryData.filter((category, index, self) => 
		index === self.findIndex(c => c.name === category.name)
	);

	const categoryRows = uniqueCategories.map((category) => ({ 
		name: category.name, 
		slug: slugify(category.name),
		imgUrl: category.imgUrl
	}));

	const insertedCategories = await db
		.insert(categories)
		.values(categoryRows)
		.onConflictDoNothing({ target: [categories.slug] })
		.returning();

	// If DO NOTHING occurred, returning() may be empty for existing rows.
	// Fetch a map of slug -> id to reliably reference categories for product mapping.
	const allCategoryRecords = insertedCategories.length
		? insertedCategories
		: await db.select().from(categories);
	const slugToCategoryId = new Map<string, number>(
		allCategoryRecords.map((c: any) => [c.slug, c.id])
	);

	function catId(name: string): number {
		const id = slugToCategoryId.get(slugify(name));
		if (!id) throw new Error(`Category not found: ${name}`);
		return id;
	}

	// 5) Product-Categories mapping (best-effort alignment by product title semantics)
	const productCategoryPairs: Array<{ productId: number; categoryId: number }> = [];

	for (const product of insertedProducts) {
		const title: string = product.title;
		if (/gamepad|games?/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Games & Videos') });
		}
		if (/iphone|phone/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Phone') });
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Mobile & Tablets') });
		}
		if (/imac|desktop/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Desktop') });
		}
		if (/macbook|laptop/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Laptop & PC') });
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Laptop') });
		}
		if (/watch/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Watches') });
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Watch') });
		}
		if (/mouse|logitech/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Laptop & PC') });
		}
		if (/ipad|tablet/i.test(title)) {
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Mobile & Tablets') });
		}
		if (/router|asus/i.test(title)) {
			// Network gear under Desktop as a rough fit
			productCategoryPairs.push({ productId: product.id, categoryId: catId('Desktop') });
		}
	}

	if (productCategoryPairs.length) {
		await db.insert(productCategories).values(productCategoryPairs);
	}

	// Done
	console.log('Seed data inserted successfully!');
}

async function addDemoProductsToExistingCategories() {
	const DEMO_CATEGORY_DESKTOP_ID = 21;
	const DEMO_CATEGORY_LAPTOP_PC_ID = 15;
	const DEMO_CATEGORY_WATCH_ID = 26;

	const demoProducts = [
		{
			title: 'Demo Desktop 1',
			price: '199.00',
			discountedPrice: '149.00',
			stock: 25,
			reviewsCount: 0,
			avgRating: '0.00',
			description: 'Demo Desktop product for seeding into existing Desktop category.'
		},
		{
			title: 'Demo Desktop 2',
			price: '299.00',
			discountedPrice: '199.00',
			stock: 20,
			reviewsCount: 0,
			avgRating: '0.00',
			description: 'Another demo Desktop product.'
		},
		{
			title: 'Demo Laptop 1',
			price: '899.00',
			discountedPrice: '799.00',
			stock: 15,
			reviewsCount: 0,
			avgRating: '0.00',
			description: 'Demo Laptop & PC product.'
		},
		{
			title: 'Demo Watch 1',
			price: '99.00',
			discountedPrice: '79.00',
			stock: 40,
			reviewsCount: 0,
			avgRating: '0.00',
			description: 'Demo Watch product for seeding.'
		},
		{
			title: 'Demo Watch 2',
			price: '149.00',
			discountedPrice: '119.00',
			stock: 35,
			reviewsCount: 0,
			avgRating: '0.00',
			description: 'Another demo Watch product.'
		},
	];

	const inserted = await db
		.insert(products)
		.values(
			demoProducts.map((p) => ({
				title: p.title,
				price: p.price,
				discountedPrice: p.discountedPrice,
				stock: p.stock,
				reviewsCount: p.reviewsCount,
				avgRating: p.avgRating,
				description: p.description,
			}))
		)
		.returning();

	if (!inserted.length) return;

	const BLANK_IMAGE_URL = '/images/products/blank.png';

	for (const product of inserted) {
		const imageRows = [
			{ productId: product.id, url: BLANK_IMAGE_URL, kind: 'thumbnail' as const, sortOrder: 0 },
			{ productId: product.id, url: BLANK_IMAGE_URL, kind: 'preview' as const, sortOrder: 0 },
		];
		await db.insert(productImages).values(imageRows);
	}

	const categoryMappings = [
		{ title: 'Demo Desktop 1', categoryId: DEMO_CATEGORY_DESKTOP_ID },
		{ title: 'Demo Desktop 2', categoryId: DEMO_CATEGORY_DESKTOP_ID },
		{ title: 'Demo Laptop 1', categoryId: DEMO_CATEGORY_LAPTOP_PC_ID },
		{ title: 'Demo Watch 1', categoryId: DEMO_CATEGORY_WATCH_ID },
		{ title: 'Demo Watch 2', categoryId: DEMO_CATEGORY_WATCH_ID },
	];

	const productCategoryRows: Array<{ productId: number; categoryId: number }> = [];
	for (const mapping of categoryMappings) {
		const prod = inserted.find((p: any) => p.title === mapping.title);
		if (prod) {
			productCategoryRows.push({ productId: prod.id, categoryId: mapping.categoryId });
		}
	}

	if (productCategoryRows.length) {
		await db.insert(productCategories).values(productCategoryRows);
	}
} 

// seed().catch((err) => {
// 	console.error(err);
// 	process.exit(1);
// }); 

addDemoProductsToExistingCategories().catch((err) => {
	console.error(err);
	process.exit(1);
});
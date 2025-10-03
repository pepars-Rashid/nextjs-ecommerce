# Next.js 15 eCommerce Web Application

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.6.1-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E699?style=for-the-badge&logo=neon&logoColor=white)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.44.4-1E6ED9?style=for-the-badge&logo=drizzle&logoColor=white)](https://orm.drizzle.team/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)


A modern, full-stack eCommerce web application built with Next.js 15. It features a robust frontend, a secure backend with API routes, and a managed database with relations. Originally forked from a frontend template, the project has been significantly enhanced with a custom backend, Redux state management, and a complete authentication system.

## 🚀 Live Demo

[![Vercel](https://img.shields.io/badge/Vercel-Live_Demo-black?style=for-the-badge&logo=vercel)](https://nextjs-ecommerce-lac-sigma.vercel.app/)

https://nextjs-ecommerce-lac-sigma.vercel.app/

## 🧩 Features

- **Frontend:** Built with Next.js 15 and Tailwind CSS. Features a responsive design and modern user interface. Originally based on the [NextMerce template](https://github.com/nextMerce/nextjs-ecommerce-template), but has been heavily modified with custom loading and error state management.
- **Backend:** Leverages Next.js built-in API Routes and "server-only" function actions for secure database queries.
- **State Management:** Uses Redux Toolkit with `createAsyncThunk` for efficient and predictable state management, especially for handling API calls.
- **Authentication:** Implements NextAuth.js with support for passwordless Google and GitHub OAuth providers, as well as traditional email and password authentication.
- **Database:** PostgreSQL hosted on a Neon serverless platform, with type-safe interactions and relations handled via Drizzle ORM.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) |
| **Authentication** | NextAuth.js |
| **Database** | PostgreSQL |
| **ORM** | Drizzle |
| **Deployment** | Vercel |

## 📁 Project Structure

This project uses the **App Router** from Next.js 15. The key directories and files are explained below:

```
nextjs-ecommerce/
├─ README.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ tsconfig.tsbuildinfo
├─ next.config.js
├─ next-env.d.ts
├─ drizzle.config.js
├─ tailwind.config.ts
├─ postcss.config.js
├─ .eslintrc.json
├─ .gitignore
├─ public/
│  ├─ 404.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ images/
│     ├─ blog/...
│     ├─ sellers/...
│     ├─ products/...
│     ├─ arrivals/...
│     ├─ categories/...
│     ├─ quickview/...
│     ├─ checkout/...
│     ├─ payment/...
│     ├─ users/...
│     ├─ hero/...
│     ├─ cart/...
│     ├─ icons/...
│     ├─ shapes/...
│     ├─ promo/...
│     └─ countdown/...
└─ src/
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ loading.tsx
   │  ├─ actions/
   │  │  └─ action.ts
   │  ├─ css/
   │  │  └─ style.css
   │  ├─ fonts/
   │  │  ├─ EuclidCircularA-Medium.woff
   │  │  ├─ EuclidCircularA-Medium.woff2
   │  │  ├─ EuclidCircularA-MediumItalic.woff
   │  │  ├─ EuclidCircularA-Regular.woff
   │  │  ├─ EuclidCircularA-Regular.woff2
   │  │  ├─ EuclidCircularA-SemiBold.woff
   │  │  ├─ EuclidCircularA-SemiBold.woff2
   │  │  ├─ EuclidCircularA-SemiBoldItalic.woff
   │  │  └─ EuclidCircularA-SemiBoldItalic.woff2
   │  ├─ context/
   │  │  ├─ CartSidebarModalContext.tsx
   │  │  └─ PreviewSliderContext.tsx
   │  ├─ handler/
   │  │  ├─ layout.tsx
   │  │  └─ [...stack]/page.tsx
   │  └─ (site)/
   │     ├─ layout.tsx
   │     ├─ page.tsx
   │     ├─ (pages)/
   │     │  ├─ product/[id]/page.tsx
   │     │  ├─ shop-details/page.tsx
   │     │  ├─ shop-with-sidebar/page.tsx
   │     │  ├─ shop-without-sidebar/page.tsx
   │     │  ├─ signin/page.tsx
   │     │  └─ signup/page.tsx
   │     └─ blogs/
   │        ├─ blog-details-with-sidebar/page.tsx
   │        └─ blog-grid-with-sidebar/page.tsx
   ├─ components/
   │  ├─ Common/
   │  │  ├─ Breadcrumb.tsx
   │  │  ├─ CartSidebarModal/
   │  │  │  ├─ EmptyCart.tsx
   │  │  │  ├─ SingleItem.tsx
   │  │  │  └─ index.tsx
   │  │  ├─ Pagination.tsx
   │  │  ├─ PreLoader.tsx
   │  │  ├─ PreviewSlider.tsx
   │  │  ├─ ProductItem.tsx
   │  │  ├─ QuickViewModal.tsx
   │  │  ├─ ScrollToTop.tsx
   │  │  └─ Newsletter.tsx
   │  ├─ Header/
   │  │  ├─ CustomSelect.tsx
   │  │  ├─ Dropdown.tsx
   │  │  ├─ index.tsx
   │  │  └─ menuData.ts
   │  ├─ Footer/
   │  │  └─ index.tsx
   │  ├─ Home/
   │  │  ├─ index.tsx
   │  │  ├─ BestSeller/
   │  │  │  ├─ SingleItem.tsx
   │  │  │  └─ index.tsx
   │  │  ├─ Categories/
   │  │  │  ├─ SingleItem.tsx
   │  │  │  ├─ categoryData.ts
   │  │  │  └─ index.tsx
   │  │  ├─ Countdown/
   │  │  │  └─ index.tsx
   │  │  ├─ Hero/
   │  │  │  ├─ HeroCarousel.tsx
   │  │  │  ├─ HeroFeature.tsx
   │  │  │  └─ index.tsx
   │  │  ├─ NewArrivals/
   │  │  │  └─ index.tsx
   │  │  ├─ PromoBanner/
   │  │  │  └─ index.tsx
   │  │  └─ Testimonials/
   │  │     ├─ SingleItem.tsx
   │  │     ├─ testimonialsData.ts
   │  │     └─ index.tsx
   │  ├─ Shop/
   │  │  ├─ SingleGridItem.tsx
   │  │  ├─ SingleListItem.tsx
   │  │  └─ shopData.ts
   │  ├─ ShopDetails/
   │  │  ├─ RecentlyViewd/
   │  │  │  └─ index.tsx
   │  │  └─ index.tsx
   │  ├─ ProductDetails/
   │  │  ├─ RecentlyViewd/
   │  │  │  └─ index.tsx
   │  │  └─ index.tsx
   │  ├─ ShopWithSidebar/
   │  │  ├─ CategoryDropdown.tsx
   │  │  ├─ ColorsDropdwon.tsx
   │  │  ├─ CustomSelect.tsx
   │  │  ├─ GenderDropdown.tsx
   │  │  ├─ Pagination.tsx
   │  │  ├─ PriceDropdown.tsx
   │  │  ├─ Progress.tsx
   │  │  └─ SizeDropdown.tsx
   │  ├─ ShopWithoutSidebar/
   │  │  └─ index.tsx
   │  ├─ Wishlist/
   │  │  ├─ SingleItem.tsx
   │  │  └─ index.tsx
   │  ├─ Cart/
   │  │  ├─ Discount.tsx
   │  │  ├─ OrderSummary.tsx
   │  │  ├─ SingleItem.tsx
   │  │  └─ index.tsx
   │  ├─ Checkout/
   │  │  ├─ Billing.tsx
   │  │  ├─ Coupon.tsx
   │  │  ├─ Login.tsx
   │  │  ├─ Notes.tsx
   │  │  ├─ OrderList.tsx
   │  │  ├─ PaymentMethod.tsx
   │  │  ├─ Shipping.tsx
   │  │  └─ ShippingMethod.tsx
   │  ├─ Blog/
   │  │  ├─ BlogItem.tsx
   │  │  ├─ Categories.tsx
   │  │  ├─ LatestPosts.tsx
   │  │  ├─ LatestProducts.tsx
   │  │  └─ SearchForm.tsx
   │  ├─ BlogGrid/
   │  │  ├─ blogData.ts
   │  │  └─ index.tsx
   │  ├─ BlogDetails/
   │  │  └─ index.tsx
   │  ├─ BlogGridWithSidebar/
   │  │  └─ index.tsx
   │  ├─ BlogDetailsWithSidebar/
   │  │  └─ index.tsx
   │  ├─ Orders/
   │  │  ├─ EditOrder.tsx
   │  │  ├─ OrderActions.tsx
   │  │  ├─ OrderDetails.tsx
   │  │  ├─ OrderModal.tsx
   │  │  ├─ ordersData.tsx
   │  │  ├─ SingleOrder.tsx
   │  │  └─ index.tsx
   │  ├─ MyAccount/
   │  │  ├─ AddressModal.tsx
   │  │  ├─ tabsData.tsx
   │  │  └─ index.tsx
   │  ├─ Auth/
   │  │  ├─ Signin/index.tsx
   │  │  └─ Signup/index.tsx
   │  ├─ Contact/
   │  │  └─ index.tsx
   │  ├─ Error/
   │  │  └─ index.tsx
   │  └─ MailSuccess/
   │     └─ index.tsx
   ├─ redux/
   │  ├─ store.ts
   │  ├─ provider.tsx
   │  └─ features/
   │     ├─ cart-slice.ts
   │     ├─ category-slice.ts
   │     ├─ product-slice.ts
   │     └─ wishlist-slice.ts
   ├─ types/
   │  ├─ cart.ts
   │  ├─ category.ts
   │  ├─ common.ts
   │  ├─ image.ts
   │  ├─ order.ts
   │  ├─ product.ts
   │  ├─ review.ts
   │  ├─ ui.ts
   │  ├─ user.ts
   │  └─ wishlist.ts
   ├─ utils/
   │  ├─ cartUtils.ts
   │  ├─ productUtils.ts
   │  └─ wishlistUtils.ts
   ├─ database/
   │  ├─ db.js
   │  ├─ schema.js
   │  └─ seed.ts
   ├─ stack-client.ts
   └─ stack-server.ts
```

## ⚙️ Installation & Setup

Follow these steps to set up the project locally:

1.  **Clone the repository**
    ```bash
    git clone https://https://github.com/pepars-Rashid/nextjs-ecommerce.git
    cd nextjs-ecommerce
    ```

2.  **Install dependencies**
    ```bash
    npm install # you may need to use --legacy-peer-deps flag beacuse of stackframe (it's safe since the conflict with lucide icons svg library)
    ```

3.  **Set up environment variables**
    Create a `.env.local` file in the root directory and add the necessary variables. Here is an example based on your tech stack:
    ```env
    # Database (Neon PostgreSQL)
    DATABASE_URL="your_neon_database_connection_string"

    # Authentication (NextAuth.js)
    NEXT_PUBLIC_STACK_PROJECT_ID="your_neonauth_id"
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_nextauth_client_key"
    STACK_SECRET_SERVER_KEY="stack_secret_server_key"
    
    # Database owner connection string
    DATABASE_URL="your_postgresql_neon_connection_url"
    ```

4.  **Set up the database**
    ```bash
    # This command will push the schema to your Neon PostgreSQL database
    npx drizzle-kit push  
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🛠️ Available Scripts

Here are some of the key scripts you can run from the project directory:

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs the development server. |
| `npm run build` | Creates a production build of the app. |
| `npm run start` | Starts the server in production mode. |
| `npm run seed` | Pushes intial data to the database. |

**⭐ Star this repository if you found it helpful!**

**🌐 [Live Demo](https://nextjs-ecommerce-lac-sigma.vercel.app/) | 📖 [Documentation](#) | 🐛 [Report Issues](#)** 
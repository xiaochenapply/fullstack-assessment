# StackShop — Bug Fix & Enhancement Report

## Overview

This document describes the bugs identified in the StackShop eCommerce application, how each was fixed, and the enhancements made. Each fix/enhancement corresponds to a single commit for easy review.

---

## Bug Fixes

### 1. Incomplete Image Domain Whitelist
**Commit:** `fix: expand image domain whitelist for all Amazon CDN subdomains`

**Problem:** Only `m.media-amazon.com` was whitelisted in `next.config.ts`. Some products use images from other Amazon CDN subdomains (e.g. `images-na.ssl-images-amazon.com`), causing a runtime crash when those images loaded — for example, **searching for "1" would immediately crash the app** because matching products had images on unwhitelisted hosts.

**Fix:** Used wildcard patterns (`**.media-amazon.com`, `**.ssl-images-amazon.com`) to cover all Amazon CDN subdomains.

**File:** `next.config.ts`

---

### 2. Product Data Passed via JSON in URL
**Commit:** `fix: use dynamic route /product/[sku] instead of passing JSON in URL`

**Problem:** The entire product object was serialized via `JSON.stringify()` and passed as a URL query parameter, exposing internal data, exceeding URL length limits, and losing data on direct navigation.

**Fix:** Created a dynamic route `/product/[sku]` that fetches data via the API. Also added proper error handling with fallback UI and image fallback for missing images.

**Files:** `app/product/[sku]/page.tsx` (new), `app/product/page.tsx` (deleted)

---

### 3. Search Triggers API on Every Keystroke
**Commit:** `fix: add 300ms debounce on search input`

**Problem:** Each character typed in the search box immediately fired an API request.

**Fix:** Added a `debouncedSearch` state with a 300ms delay using `useEffect` + `setTimeout`.

**File:** `app/page.tsx`

---

### 4. No Way to Reset Category Dropdown
**Commit:** `fix: add 'All Categories' and 'All Subcategories' reset options`

**Problem:** Once a category was selected, no way to deselect it from within the dropdown.

**Fix:** Added explicit "All Categories" and "All Subcategories" options at the top of each dropdown.

**File:** `app/page.tsx`

---

### 5. Default Page Metadata
**Commit:** `fix: update page metadata from default 'Create Next App' to 'StackShop'`

**Problem:** Browser tab still showed "Create Next App".

**Fix:** Changed title to `"StackShop"` and description to `"Browse our eCommerce product catalog"`.

**File:** `app/layout.tsx`

---

### 6. Misaligned "View Details" Buttons + Missing Image Fallback
**Commit:** `fix: align View Details buttons across product cards`

**Problem:** Product cards had inconsistent button positions due to varying title lengths. Products with no images showed blank space.

**Fix:**
- Used flexbox (`flex-col`, `flex-1`, `mt-auto`) to push buttons to the bottom
- Added "No image" fallback text for missing images
- Added `title` attribute for long product names (hover to see full name)

**File:** `app/page.tsx`

---

### 7. No Pagination
**Commit:** `fix: add pagination to product list`

**Problem:** Only the first 20 products were displayed with no way to see more.

**Fix:** Added full pagination with numbered page buttons and ellipsis (e.g. `< 1 … 8 9 [10] 11 12 … 25 >`), supporting direct page jump. Auto-resets page when filters change. Shows "Showing X-Y of Z products".

**File:** `app/page.tsx`

---

### 8. Subcategories Not Filtered by Category
**Commit:** `fix: pass category param to subcategories API`

**Problem:** Subcategories fetch didn't pass the selected category, showing all subcategories from every category.

**Fix:** Pass category as query parameter: `fetch(/api/subcategories?category=${selectedCategory})`

**File:** `app/page.tsx`

---

### 9. No Error Handling on Fetch Calls
**Commit:** `fix: add error handling to all fetch calls with retry UI`

**Problem:** All `fetch()` calls had no `.catch()`. Failed API calls showed perpetual "Loading..." with no recovery.

**Fix:**
- Products fetch: Shows error message with a **Retry** button
- Categories/subcategories: Errors logged to console
- Added `res.ok` check before parsing JSON

**File:** `app/page.tsx`

---

### 10. Missing `retailPrice` in Backend Product Interface
**Commit:** `fix: address remaining bugs and security issues`

**Problem:** The `Product` interface in `lib/products.ts` did not include the `retailPrice` field. While the JSON data contained this field and it worked at runtime, the TypeScript type was incomplete.

**Fix:** Added `retailPrice: number` to the backend `Product` interface.

**File:** `lib/products.ts`

---

### 11. `selectedImage` Not Reset Between Products
**Commit:** `fix: address remaining bugs and security issues`

**Problem:** When navigating from one product to another (e.g. via "You May Also Like"), the `selectedImage` index was not reset. If product A had 8 images and the user selected image 7, navigating to product B (which may only have 3 images) would cause an out-of-bounds index.

**Fix:** Reset `selectedImage` to `0` whenever the `sku` changes.

**File:** `app/product/[sku]/page.tsx`

---

### 12. Inefficient `getTotalCount` — Double Filtering
**Commit:** `fix: address remaining bugs and security issues`

**Problem:** Every products API request executed the filtering logic twice: once in `getAll()` to get paginated results, and again in `getTotalCount()` just to count the total.

**Fix:** Refactored `getAll()` to return `{ products, total }` by running the filter once and returning both the sliced page and the full count. Removed the separate `getTotalCount()` method.

**Files:** `lib/products.ts`, `app/api/products/route.ts`

---

### 13. No Input Validation on API Parameters
**Commit:** `fix: address remaining bugs and security issues`

**Problem:** The `/api/products` endpoint accepted `limit` and `offset` without validation. A malicious or malformed request could pass `limit=999999` or negative values.

**Fix:**
- `limit` clamped to range 1–100 (default: 20)
- `offset` clamped to ≥ 0 (default: 0)
- NaN values fall back to defaults

**File:** `app/api/products/route.ts`

---

### 14. No NaN Guard on Page URL Parameter
**Commit:** `fix: address remaining bugs and security issues`

**Problem:** If the URL contained `?page=abc`, `parseInt` returned `NaN`, causing broken pagination.

**Fix:** Added NaN and negative value check, falling back to page 1.

**File:** `app/page.tsx`

---

## Enhancements

### 15. Product Image Gallery with Navigation
**Commit:** `fix: use dynamic route /product/[sku] instead of passing JSON in URL`

Added interactive image gallery on the product detail page:
- **Arrow buttons** (left/right) on the main image to cycle through product images
- **Hover-to-switch thumbnails** — hovering over a thumbnail instantly updates the main image
- Visual feedback with scale animation and ring highlight on active thumbnail

**File:** `app/product/[sku]/page.tsx`

---

### 16. Price Display on Product Cards and Detail Page
**Commit:** `fix: align View Details buttons across product cards` / `fix: use dynamic route /product/[sku]`

The `retailPrice` field from the product data was not displayed anywhere in the UI.

- **Product list:** Added bold price below the category badge on each card
- **Product detail:** Added large, primary-colored price below the product title

**Files:** `app/page.tsx`, `app/product/[sku]/page.tsx`

---

### 17. "You May Also Like" Related Products
**Commit:** `enhance: add 'You May Also Like' related products section`

Added a related products section to the product detail page:
- Shows up to 5 products from the same **subcategory**
- Falls back to the parent **category** if no subcategory matches
- Excludes the current product
- Each card shows image, title, and price with link to product page

**File:** `app/product/[sku]/page.tsx`

---

### 18. Searchable Category & Subcategory Dropdowns
**Commit:** `enhance: add searchable category and subcategory dropdowns`

Replaced the standard Radix Select with a custom `SearchableSelect` component:
- Built-in text filter input at the top of the dropdown
- Real-time filtering as you type
- Ellipsis truncation for long names with hover tooltip
- Subcategory auto-cleared when switching category

**Files:** `components/ui/searchable-select.tsx` (new), `app/page.tsx`

---

### 19. Clickable Category & Subcategory Badges
**Commit:** `fix: address remaining bugs and security issues`

Made the category and subcategory badges on the product detail page clickable:
- Clicking the **category badge** navigates to `/?category=...` to show all products in that category
- Clicking the **subcategory badge** navigates to `/?category=...&subCategory=...` to show the subcategory

**File:** `app/product/[sku]/page.tsx`

---

## Summary

| # | Issue | Type | Severity |
|---|-------|------|----------|
| 1 | Image domain whitelist (search crash) | Bug | Critical |
| 2 | Product data in URL (security) | Bug | Critical |
| 3 | No search debounce | Bug | Medium |
| 4 | Can't reset category | Bug | Medium |
| 5 | Default metadata | Bug | Low |
| 6 | Button alignment + image fallback | Bug | Medium |
| 7 | No pagination / page jump | Bug | High |
| 8 | Subcategories not filtered | Bug | Medium |
| 9 | No error handling | Bug | High |
| 10 | Missing `retailPrice` in interface | Bug | Low |
| 11 | `selectedImage` not reset | Bug | Medium |
| 12 | Double filtering (performance) | Bug | Low |
| 13 | No API input validation | Security | Medium |
| 14 | No NaN guard on page param | Bug | Low |
| 15 | Image gallery with navigation | Enhancement | — |
| 16 | Price display | Enhancement | — |
| 17 | "You May Also Like" section | Enhancement | — |
| 18 | Searchable dropdowns | Enhancement | — |
| 19 | Clickable category badges | Enhancement | — |

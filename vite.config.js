import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "images-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
						},
					},
					{
						urlPattern: /\.(?:js|css)$/,
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "static-resources-cache",
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
							},
						},
					},
				],
				skipWaiting: true,
				clientsClaim: true,
				cleanupOutdatedCaches: true,
			},
			includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
			manifest: {
				name: "FastTrackr",
				short_name: "FastTrackr",
				description: "A Progressive Web App for tracking intermittent fasting",
				theme_color: "#2563eb",
				background_color: "#ffffff",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "icons/manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "icons/manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "icons/manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
				screenshots: [
					{
						src: "screenshots/fasttrackr.netlify.app_desktop.png",
						sizes: "1280x720",
						type: "image/png",
						form_factor: "wide",
					},
					{
						src: "screenshots/fasttrackr.netlify.app_mobile.png",
						sizes: "390x844",
						type: "image/png",
						form_factor: "narrow",
					},
				],
				categories: ["health", "fitness", "lifestyle"],
				lang: "en",
				dir: "ltr",
			},
			devOptions: {
				enabled: true,
				type: "module",
				navigateFallback: "index.html",
			},
		}),
	],
	build: {
		outDir: "dist",
		assetsDir: "assets",
		sourcemap: true,
	},
	server: {
		port: 3000,
		open: true,
	},
	publicDir: "public",
});

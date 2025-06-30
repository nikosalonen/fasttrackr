import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "gstatic-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
						},
					},
				],
			},
			includeAssets: ["icons/apple-icon-180.png", "icons/icon-base.svg"],
			manifest: {
				name: "FastTrackr - Intermittent Fasting Timer",
				short_name: "FastTrackr",
				description: "Simple and effective intermittent fasting tracker. Monitor your fasting progress with beautiful circular timers and detailed history.",
				theme_color: "#2563eb",
				background_color: "#ffffff",
				display: "standalone",
				display_override: ["window-controls-overlay", "standalone"],
				orientation: "portrait-primary",
				scope: "/",
				start_url: "/",
				categories: ["health", "fitness", "lifestyle", "medical"],
				icons: [
					{
						src: "icons/apple-icon-180.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "icons/manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
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
						purpose: "any",
					},
					{
						src: "icons/manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
				screenshots: [
					{
						src: "screenshots/fasttrackr.netlify.app_mobile.png",
						sizes: "800x1700",
						type: "image/png",
						form_factor: "narrow",
					},
					{
						src: "screenshots/fasttrackr.netlify.app_desktop.png",
						sizes: "2670x2246",
						type: "image/png",
						form_factor: "wide",
					},
				],
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

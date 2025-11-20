import type {
	CustomConfigs,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Lovemilk Notes",
	subtitle: "Remake 2.0",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 3, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{
			src: '/favicon/lovemilk2333.png',
			sizes: '32x32'
		},
		{
			src: '/favicon/lovemilk2333.png',
			sizes: '64x64'
		},
		{
			src: '/favicon/lovemilk2333.png',
			sizes: '128x128'
		},
		{
			src: '/favicon/lovemilk2333.png',
			sizes: '192x192'
		},

		{
			src: '/favicon/lovemilk2333.png',
			sizes: '256x256'
		},
		{
			src: '/favicon/lovemilk2333.png',
			sizes: '320x320'
		}
	]
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://aka.lovemilk.top/github/notes", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
		{
			name: "*本网站迁移通知",
			url: "/posts/blogs/remake-notice/"
		}
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/favicon/lovemilk2333-460.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "lovemilk (lovemilk233, lovemilk2333)",
	copyrightStartYear: 2025,
	bio: ">_",
	links: [
		// {
		// 	name: "Twitter",
		// 	icon: "fa6-brands:twitter", // Visit https://icones.js.org/ for icon codes
		// 	// You will need to install the corresponding icon set if it's not already included
		// 	// `pnpm add @iconify-json/<icon-set-name>`
		// 	url: "https://twitter.com",
		// },
		// {
		// 	name: "Steam",
		// 	icon: "fa6-brands:steam",
		// 	url: "https://store.steampowered.com",
		// },
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://aka.lovemilk.top/github",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "All Rights Reserved",
	url: "https://aka.lovemilk.top/68",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

export const customConfigs: CustomConfigs = {
	chinesePassageComment: {
		totalScore: 100
	}
}

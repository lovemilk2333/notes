import { licenseConfig, siteConfig } from "@/config";
import type { SiteConfig } from "@/types/config";

export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

export function getCopyright(copyrightMetadata?: string | { name: string; url: string }): { name: string; url?: string } {
	let licenseConf;
	if (!copyrightMetadata || !Object.keys(copyrightMetadata).length) {
		licenseConf = licenseConfig;
	} else {
		licenseConf = typeof copyrightMetadata === "string" ? { name: copyrightMetadata } : copyrightMetadata;
	}

	return licenseConf
}

export function getPermalink(url: URL, permalinkMetadata?: SiteConfig['permalink']) {
	const permalinkConfig = permalinkMetadata || siteConfig.permalink;

	if (!!permalinkConfig) {
		const base = new URL(permalinkConfig.base);

		const placeholder = permalinkConfig.placeholder;
		if (!!placeholder && !!placeholder.length) {
			url.href = base.href.replace(placeholder, url.pathname + url.search);
		} else if (placeholder === false) {
			url.href = base.href;
		} else {
			url.protocol = base.protocol;
			url.host = base.host;
			url.port = base.port;
			url.pathname = base.pathname + url.pathname;
			base.searchParams.forEach((val, key) => {
				url.searchParams.set(key, val);
			});
		}
	}

	return url
}

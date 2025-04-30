CREATE TABLE `icons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_slug` text NOT NULL,
	`url` text NOT NULL,
	`sizes` text,
	FOREIGN KEY (`site_slug`) REFERENCES `sites`(`slug`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `sites` (
	`slug` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`hostname` text NOT NULL,
	`domain` text NOT NULL,
	`language` text,
	`title` text,
	`site_name` text,
	`description` text,
	`og_image` text,
	`is_adult_content` integer DEFAULT 0 NOT NULL,
	`has_ssr` integer DEFAULT 0 NOT NULL,
	`is_static` integer,
	`vue_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `sites_url_unique` ON `sites` (`url`);
CREATE TABLE `technologies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_slug` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`version` text,
	FOREIGN KEY (`site_slug`) REFERENCES `sites`(`slug`) ON UPDATE no action ON DELETE cascade
);

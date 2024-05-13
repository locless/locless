CREATE TABLE `components` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`size` integer NOT NULL,
	`fileUrl` text(256) NOT NULL,
	`projectId` text(36) NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`workspaceId` text(36) NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`tenantId` text(256) NOT NULL,
	`name` text(256) NOT NULL,
	`plan` text(256) NOT NULL,
	`isPersonal` integer NOT NULL,
	`stripeCustomerId` text(256),
	`stripeSubscriptionId` text(256),
	`subscriptions` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `projectIdx` ON `components` (`projectId`);--> statement-breakpoint
CREATE INDEX `workspaceIdx` ON `projects` (`workspaceId`);--> statement-breakpoint
CREATE UNIQUE INDEX `workspaces_tenantId_unique` ON `workspaces` (`tenantId`);
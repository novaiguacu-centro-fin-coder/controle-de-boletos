CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_created_at` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `deduction_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`compensated_amount_cents` integer NOT NULL,
	`deduction_amount_cents` integer NOT NULL,
	`payment_method` text,
	`unit_id` text,
	`plan` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`reason` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rules_lookup` ON `deduction_rules` (`compensated_amount_cents`,`active`,`start_date`);--> statement-breakpoint
CREATE INDEX `idx_rules_unit_id` ON `deduction_rules` (`unit_id`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`imported_by` text NOT NULL,
	`imported_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`total_records` integer DEFAULT 0 NOT NULL,
	`valid_records` integer DEFAULT 0 NOT NULL,
	`duplicate_records` integer DEFAULT 0 NOT NULL,
	`rejected_records` integer DEFAULT 0 NOT NULL,
	`total_amount_cents` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`imported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`bank_transaction_id` text,
	`duplicate_key` text NOT NULL,
	`payer_name` text NOT NULL,
	`document` text NOT NULL,
	`payment_date` text NOT NULL,
	`compensation_date` text,
	`payment_method` text NOT NULL,
	`plan` text,
	`original_amount_cents` integer NOT NULL,
	`deduction_amount_cents` integer DEFAULT 0 NOT NULL,
	`amount_to_settle_cents` integer NOT NULL,
	`unit_id` text,
	`rule_id` text,
	`import_batch_id` text NOT NULL,
	`source_filename` text NOT NULL,
	`status` text NOT NULL,
	`rejection_reason` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_id`) REFERENCES `deduction_rules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_payments_bank_transaction` ON `payments` (`bank_transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_duplicate_key` ON `payments` (`duplicate_key`);--> statement-breakpoint
CREATE INDEX `idx_payments_unit_date_status` ON `payments` (`unit_id`,`payment_date`,`status`);--> statement-breakpoint
CREATE INDEX `idx_payments_batch_id` ON `payments` (`import_batch_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_expires` ON `sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_code_unique` ON `units` (`code`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`unit_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_users_unit_id` ON `users` (`unit_id`);
--> statement-breakpoint
PRAGMA optimize;

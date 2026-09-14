ALTER TABLE `import_batches` ADD COLUMN `source_headers` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD COLUMN `source_values` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_payments_unit_status_date` ON `payments` (`unit_id`,`status`,`payment_date`);

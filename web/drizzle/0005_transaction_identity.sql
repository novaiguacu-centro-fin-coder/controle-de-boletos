ALTER TABLE `payments` ADD COLUMN `charge_id` text;--> statement-breakpoint
ALTER TABLE `payments` ADD COLUMN `source_uuid` text;--> statement-breakpoint
ALTER TABLE `payments` ADD COLUMN `store_name` text;--> statement-breakpoint
ALTER TABLE `payments` ADD COLUMN `transaction_key` text;--> statement-breakpoint
ALTER TABLE `payments` ADD COLUMN `payment_reference` text;--> statement-breakpoint
CREATE INDEX `idx_payments_source_uuid` ON `payments` (`source_uuid`);--> statement-breakpoint
CREATE INDEX `idx_payments_transaction_key` ON `payments` (`transaction_key`);

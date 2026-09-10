CREATE TABLE `unit_groups` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL UNIQUE,
  `active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
--> statement-breakpoint
ALTER TABLE `units` ADD COLUMN `group_id` text REFERENCES `unit_groups`(`id`);
--> statement-breakpoint
CREATE INDEX `idx_units_group_id` ON `units` (`group_id`);
--> statement-breakpoint
INSERT INTO `unit_groups` (`id`, `name`, `active`) VALUES
  ('group-ni', 'NI', 1),
  ('group-sjm', 'SJM', 1),
  ('group-vilar', 'Vilar', 1);

ALTER TABLE `users` ADD COLUMN `unit_group_id` text REFERENCES `unit_groups`(`id`);
--> statement-breakpoint
CREATE INDEX `idx_users_unit_group_id` ON `users` (`unit_group_id`);
--> statement-breakpoint
UPDATE `users` SET `unit_group_id` = (SELECT `group_id` FROM `units` WHERE `units`.`id` = `users`.`unit_id`) WHERE `role` = 'OPERATOR' AND `unit_group_id` IS NULL;

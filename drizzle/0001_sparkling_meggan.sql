CREATE INDEX `idx_posts_user_id` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_created_at` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_summaries_user_id` ON `summaries` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_summaries_date_range` ON `summaries` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `idx_summaries_type` ON `summaries` (`type`);

-- seed
INSERT INTO users (id, email, name, avatar_url) VALUES ('user1', 'abcdef@hoge.com', 'user1', 'https://example.com/avatar1.png');
INSERT INTO users (id, email, name, avatar_url) VALUES ('user2', 'ghijkl@hoge.com', 'user2', 'https://example.com/avatar2.png');
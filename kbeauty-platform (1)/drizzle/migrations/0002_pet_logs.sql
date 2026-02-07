CREATE TABLE IF NOT EXISTS `daily_checkins` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` int NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cycle_day` int NULL,
  `mood` varchar(32) NULL,
  `energy` int NULL,
  `skin_condition` varchar(64) NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `food_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` int NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `food_item` varchar(100) NOT NULL,
  `trigger_level` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `skin_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` int NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `breakouts` int NULL,
  `sensitivity` int NULL,
  `notes` text NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


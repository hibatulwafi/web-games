-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.39 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table unionweb_prod.members_missions
CREATE TABLE IF NOT EXISTS `members_missions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` enum('mission','event','tier_bonus','yearly_bonus','custom') NOT NULL DEFAULT 'mission',
  `frequency` enum('once','daily','weekly','monthly','yearly','none') NOT NULL DEFAULT 'monthly',
  `mission_name` varchar(255) NOT NULL,
  `description` text,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table unionweb_prod.members_missions: ~4 rows (approximately)
INSERT INTO `members_missions` (`id`, `category`, `frequency`, `mission_name`, `description`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'tier_bonus', 'yearly', 'Tier Bonus', 'Bonus points for upgrading tier.', NULL, NULL, 1, '2025-12-09 02:07:44', '2025-12-09 02:07:44'),
	(2, 'mission', 'monthly', 'Monthly Total Purchase Bonus', 'Bonus point at end of month.', '2025-01-01 00:00:00', NULL, 1, '2025-12-09 02:07:44', '2025-12-09 02:07:44'),
	(3, 'event', 'once', 'Bonus Awal Tahun', 'Event awal tahun.', '2026-01-01 00:00:00', '2026-01-03 00:00:00', 1, '2025-12-09 02:07:44', '2025-12-09 02:07:44'),
	(4, 'event', 'weekly', 'Weekend Bonus', 'Bonus setiap weekend.', NULL, NULL, 1, '2025-12-09 02:07:44', '2025-12-09 02:07:44');

-- Dumping structure for table unionweb_prod.members_mission_conditions
CREATE TABLE IF NOT EXISTS `members_mission_conditions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `mission_id` bigint unsigned NOT NULL,
  `condition_type` enum('tier_upgrade','min_purchase','total_order','purchase_product','purchase_brand','purchase_category','min_qty','weekend','date_range','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `operator` enum('=','>=','<=','>','<','between','in','contains') NOT NULL DEFAULT '=',
  `value` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_mission_conditions` (`mission_id`),
  CONSTRAINT `fk_mission_conditions` FOREIGN KEY (`mission_id`) REFERENCES `members_missions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table unionweb_prod.members_mission_conditions: ~4 rows (approximately)
INSERT INTO `members_mission_conditions` (`id`, `mission_id`, `condition_type`, `operator`, `value`, `created_at`, `updated_at`) VALUES
	(5, 1, 'tier_upgrade', 'in', '["silver", "gold", "platinum"]', '2025-12-09 02:09:59', '2025-12-09 02:09:59'),
	(6, 2, 'min_purchase', '>=', '{"gold": 2000000, "silver": 850000, "platinum": 5000000}', '2025-12-09 02:09:59', '2025-12-09 02:09:59'),
	(7, 3, 'date_range', 'between', '{"end": "2026-01-03", "start": "2026-01-01"}', '2025-12-09 02:09:59', '2025-12-09 02:09:59'),
	(8, 4, 'weekend', 'in', '[6, 7]', '2025-12-09 02:09:59', '2025-12-09 02:09:59');

-- Dumping structure for table unionweb_prod.members_mission_rewards
CREATE TABLE IF NOT EXISTS `members_mission_rewards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `mission_id` bigint unsigned NOT NULL,
  `tier` enum('green','silver','gold','platinum') NOT NULL,
  `reward_type` enum('point','voucher','multiplier') NOT NULL DEFAULT 'point',
  `reward_value` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_mission_rewards` (`mission_id`),
  CONSTRAINT `fk_mission_rewards` FOREIGN KEY (`mission_id`) REFERENCES `members_missions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table unionweb_prod.members_mission_rewards: ~10 rows (approximately)
INSERT INTO `members_mission_rewards` (`id`, `mission_id`, `tier`, `reward_type`, `reward_value`, `created_at`, `updated_at`) VALUES
	(1, 1, 'silver', 'point', 25000.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(2, 1, 'gold', 'point', 50000.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(3, 1, 'platinum', 'point', 100000.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(4, 2, 'silver', 'point', 5000.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(5, 2, 'gold', 'point', 10000.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(6, 2, 'platinum', 'point', 20000.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(7, 3, 'gold', 'multiplier', 2.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(8, 3, 'platinum', 'multiplier', 3.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(9, 4, 'gold', 'multiplier', 2.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03'),
	(10, 4, 'platinum', 'multiplier', 3.00, '2025-12-09 02:10:03', '2025-12-09 02:10:03');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

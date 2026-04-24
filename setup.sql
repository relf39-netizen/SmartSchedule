-- สคริปต์สำหรับสร้างฐานข้อมูลใน phpMyAdmin (MySQL)
-- สำหรับระบบ SmartSchedule AI (SchoolOS Timetable)

-- 1. สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS `schoolos_timetable` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `schoolos_timetable`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for teachers
-- ----------------------------
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizen_id` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `school` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `ai_key` text DEFAULT NULL,
  `role` enum('teacher','admin') DEFAULT 'teacher',
  `status` enum('pending','active','rejected') DEFAULT 'pending',
  `login_count` int(11) DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citizen_id` (`citizen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for timetables
-- ----------------------------
CREATE TABLE IF NOT EXISTS `timetables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `data` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `timetables_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for subjects
-- ----------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `weekly_hours` int(11) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for classes
-- ----------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for rooms
-- ----------------------------
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Insert Initial Admin User
-- Username: peyarm
-- Password: Siam@2520
-- ----------------------------
INSERT INTO `teachers` (`citizen_id`, `password`, `name`, `surname`, `school`, `position`, `status`, `role`) 
VALUES ('peyarm', '$2b$10$HS9dc4t6U7QkH35xLKDQVOaNt6l8XYJ06./oMZjtok.fGQp9Gw.pW', 'Administrator', 'System', 'Main School', 'Admin', 'active', 'admin')
ON DUPLICATE KEY UPDATE `status`='active', `role`='admin';

SET FOREIGN_KEY_CHECKS = 1;

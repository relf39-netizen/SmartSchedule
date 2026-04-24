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
  `citizen_id` varchar(13) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `school` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `ai_key` text DEFAULT NULL,
  `status` enum('pending','active','rejected') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `citizen_id` (`citizen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for exercises
-- ----------------------------
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `course` varchar(255) NOT NULL,
  `grade` varchar(50) NOT NULL,
  `indicators` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- สคริปต์สำหรับสร้างฐานข้อมูลใน phpMyAdmin (MySQL)
-- สำหรับระบบ SmartSchedule AI (SchoolOS Timetable)

-- 1. สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS `schoolos_timetable` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `schoolos_timetable`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for settings (ระบบตั้งค่าพื้นฐาน)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_name` varchar(255) NOT NULL,
  `academic_year` varchar(10) NOT NULL,
  `semester` varchar(10) NOT NULL,
  `periods_per_day` int(11) NOT NULL DEFAULT '8',
  `period_duration` int(11) NOT NULL DEFAULT '50',
  `start_time` time NOT NULL DEFAULT '08:30:00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for fixed_periods (คาบเรียนที่กำหนดค่าคงที่)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `fixed_periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_name` varchar(255) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `period_number` int(11) NOT NULL,
  `is_lunch_break` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for subjects
-- ----------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `level` varchar(50) NOT NULL, -- ระดับชั้น
  `weekly_hours` int(11) NOT NULL DEFAULT '1',
  `color` varchar(20) DEFAULT '#4f46e5',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for rooms
-- ----------------------------
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(100) DEFAULT 'ทั่วไป', -- ทั่วไป, ห้องปฏิบัติการ, ฯลฯ
  `capacity` int(11) DEFAULT '40',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for classes (ข้อมูลการจัดการชั้นเรียน)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL, -- เช่น ม.1/1
  `level` varchar(50) NOT NULL, -- เช่น ม.1
  `main_room_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `main_room_id` (`main_room_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`main_room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for teaching_assignments (กำหนดการสอน/หน้าที่สอน)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `teaching_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `hours_per_week` int(11) NOT NULL,
  `is_double_period` tinyint(1) DEFAULT '0', -- คาบคู่
  `main_room_id` int(11) DEFAULT NULL,
  `backup_room_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `ta_teacher_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ta_subject_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ta_class_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for timetables
-- ----------------------------
CREATE TABLE IF NOT EXISTS `timetables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL, -- ถ้าเป็น NULL อาจจะเป็นตารางรวมหรือตารางห้อง
  `class_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `data` longtext NOT NULL, -- JSON
  `academic_year` varchar(10) DEFAULT NULL,
  `semester` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Insert Initial Configuration
-- ----------------------------
INSERT INTO `settings` (`school_name`, `academic_year`, `semester`, `periods_per_day`, `period_duration`, `start_time`)
VALUES ('โรงเรียนสมาร์ทเทคโนโลยี', '2567', '1', 8, 50, '08:30:00');

-- ----------------------------
-- Insert Initial Admin User
-- ----------------------------
INSERT INTO `teachers` (`citizen_id`, `password`, `name`, `surname`, `school`, `position`, `status`, `role`)
VALUES ('peyarm', '$2b$10$HS9dc4t6U7QkH35xLKDQVOaNt6l8XYJ06./oMZjtok.fGQp9Gw.pW', 'Administrator', 'System', 'Main School', 'Admin', 'active', 'admin')
ON DUPLICATE KEY UPDATE `status`='active', `role`='admin';

SET FOREIGN_KEY_CHECKS = 1;

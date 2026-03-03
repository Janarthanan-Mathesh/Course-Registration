-- =============================================
-- COURSE REGISTRATION APP - SQL DATABASE SCHEMA
-- Database: MySQL / PostgreSQL Compatible
-- =============================================

-- Drop tables if exists (for fresh installation)
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Certificates;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS UniversalCourses;
DROP TABLE IF EXISTS AcademicCourses;
DROP TABLE IF EXISTS Admins;
DROP TABLE IF EXISTS Users;

-- =============================================
-- TABLE: Users
-- Stores student/user information
-- =============================================
CREATE TABLE Users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    profile_image_url VARCHAR(255),
    account_status ENUM('active', 'blocked', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- =============================================
-- TABLE: Admins
-- Stores admin/controller information
-- =============================================
CREATE TABLE Admins (
    admin_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email)
);

-- =============================================
-- TABLE: AcademicCourses
-- Stores college/university courses
-- =============================================
CREATE TABLE AcademicCourses (
    course_id VARCHAR(50) PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT NOT NULL,
    faculty_name VARCHAR(255),
    semester INT NOT NULL,
    year INT NOT NULL,
    department VARCHAR(100),
    college_domain VARCHAR(100) NOT NULL,
    syllabus_url VARCHAR(255),
    prerequisites TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Admins(admin_id) ON DELETE SET NULL,
    INDEX idx_semester (semester),
    INDEX idx_college_domain (college_domain),
    INDEX idx_course_code (course_code)
);

-- =============================================
-- TABLE: UniversalCourses
-- Stores market-based courses (Udemy, Coursera, etc.)
-- =============================================
CREATE TABLE UniversalCourses (
    course_id VARCHAR(50) PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    provider ENUM('Udemy', 'Coursera', 'AWS', 'Oracle', 'Pega', 'edX', 'LinkedIn Learning', 'Other') NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    price VARCHAR(20),
    rating DECIMAL(2,1),
    total_reviews INT DEFAULT 0,
    course_url VARCHAR(500),
    thumbnail_url VARCHAR(255),
    category VARCHAR(100),
    tags JSON,
    language VARCHAR(50) DEFAULT 'English',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Admins(admin_id) ON DELETE SET NULL,
    INDEX idx_provider (provider),
    INDEX idx_skill_level (skill_level),
    INDEX idx_category (category)
);

-- =============================================
-- TABLE: Enrollments
-- Tracks course registrations and progress
-- =============================================
CREATE TABLE Enrollments (
    enrollment_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    course_type ENUM('academic', 'universal') NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_status ENUM('enrolled', 'in_progress', 'completed', 'dropped') DEFAULT 'enrolled',
    progress_percentage INT DEFAULT 0,
    last_accessed TIMESTAMP,
    completion_date TIMESTAMP,
    grade VARCHAR(5),
    certificate_issued BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_completion_status (completion_status),
    UNIQUE KEY unique_enrollment (user_id, course_id, course_type)
);

-- =============================================
-- TABLE: Certificates
-- Stores certificate information
-- =============================================
CREATE TABLE Certificates (
    certificate_id VARCHAR(50) PRIMARY KEY,
    enrollment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    course_type ENUM('academic', 'universal') NOT NULL,
    certificate_url VARCHAR(500),
    issue_date DATE,
    verification_code VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES Enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES Admins(admin_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_verification_code (verification_code)
);

-- =============================================
-- TABLE: Notifications
-- Stores user notifications
-- =============================================
CREATE TABLE Notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    notification_type ENUM('course_enrollment', 'course_completion', 'certificate_approved', 'system_update', 'reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert Sample Admin
INSERT INTO Admins (admin_id, username, email, password_hash, full_name, role) VALUES
('ADM001', 'admin', 'admin@bitsathy.ac.in', '$2b$10$encrypted_password_hash', 'System Administrator', 'super_admin');

-- Insert Sample Users
INSERT INTO Users (user_id, username, email, password_hash, phone_number, phone_verified, email_verified, linkedin_url, github_url) VALUES
('U001', 'janarthanan', 'janarthanan.ad23@bitsathy.ac.in', '$2b$10$encrypted_password_hash', '+919876543210', TRUE, TRUE, 'https://linkedin.com/in/janarthanan', 'https://github.com/janarthanan'),
('U002', 'priya_sharma', 'priya.ad23@bitsathy.ac.in', '$2b$10$encrypted_password_hash', '+919876543211', TRUE, TRUE, NULL, NULL),
('U003', 'rahul_kumar', 'rahul.ad23@bitsathy.ac.in', '$2b$10$encrypted_password_hash', '+919876543212', TRUE, FALSE, NULL, NULL);

-- Insert Sample Academic Courses
INSERT INTO AcademicCourses (course_id, course_code, course_name, description, credits, faculty_name, semester, year, department, college_domain, created_by) VALUES
('AC001', 'CS301', 'Data Structures and Algorithms', 'Advanced data structures including trees, graphs, and algorithm analysis', 4, 'Dr. Rajesh Kumar', 3, 2, 'Computer Science', 'bitsathy.ac.in', 'ADM001'),
('AC002', 'CS302', 'Database Management Systems', 'Relational databases, SQL, normalization, and transaction management', 3, 'Prof. Priya Sharma', 3, 2, 'Computer Science', 'bitsathy.ac.in', 'ADM001'),
('AC003', 'CS303', 'Operating Systems', 'Process management, memory management, and file systems', 4, 'Dr. Arun Patel', 3, 2, 'Computer Science', 'bitsathy.ac.in', 'ADM001'),
('AC004', 'CS304', 'Computer Networks', 'Network protocols, TCP/IP, routing, and network security', 3, 'Prof. Meena Reddy', 4, 2, 'Computer Science', 'bitsathy.ac.in', 'ADM001'),
('AC005', 'CS401', 'Machine Learning', 'Introduction to ML algorithms, supervised and unsupervised learning', 4, 'Dr. Suresh Babu', 5, 3, 'Computer Science', 'bitsathy.ac.in', 'ADM001');

-- Insert Sample Universal Courses
INSERT INTO UniversalCourses (course_id, course_name, provider, description, duration, skill_level, price, rating, total_reviews, category, created_by) VALUES
('UC001', 'Complete Python Bootcamp', 'Udemy', 'Learn Python like a Professional! Start from basics to creating your own applications', '40 hours', 'Beginner', 'Free', 4.6, 125000, 'Programming', 'ADM001'),
('UC002', 'AWS Certified Solutions Architect', 'AWS', 'Prepare for AWS certification with hands-on labs and real-world scenarios', '60 hours', 'Intermediate', '$49.99', 4.8, 85000, 'Cloud Computing', 'ADM001'),
('UC003', 'Full Stack Web Development', 'Coursera', 'Master React, Node.js, MongoDB and build complete web applications', '50 hours', 'Intermediate', 'Free', 4.7, 95000, 'Web Development', 'ADM001'),
('UC004', 'Oracle Database Administrator', 'Oracle', 'Become an Oracle DBA with comprehensive training on database administration', '70 hours', 'Advanced', '$99.99', 4.5, 45000, 'Database', 'ADM001'),
('UC005', 'Pega System Architect', 'Pega', 'Learn Pega platform for building enterprise applications', '45 hours', 'Intermediate', '$79.99', 4.4, 32000, 'Enterprise Software', 'ADM001');

-- Insert Sample Enrollments
INSERT INTO Enrollments (enrollment_id, user_id, course_id, course_type, completion_status, progress_percentage, last_accessed) VALUES
('EN001', 'U001', 'AC001', 'academic', 'in_progress', 65, CURRENT_TIMESTAMP),
('EN002', 'U001', 'UC001', 'universal', 'in_progress', 40, CURRENT_TIMESTAMP),
('EN003', 'U001', 'UC003', 'universal', 'in_progress', 85, CURRENT_TIMESTAMP),
('EN004', 'U002', 'AC001', 'academic', 'in_progress', 50, CURRENT_TIMESTAMP),
('EN005', 'U002', 'UC002', 'universal', 'completed', 100, CURRENT_TIMESTAMP);

-- Insert Sample Certificates
INSERT INTO Certificates (certificate_id, enrollment_id, user_id, course_id, course_type, issue_date, verification_code, is_verified, verified_by) VALUES
('CERT001', 'EN005', 'U002', 'UC002', 'universal', CURDATE(), 'VERIFY-UC002-U002-2024', TRUE, 'ADM001');

-- Insert Sample Notifications
INSERT INTO Notifications (notification_id, user_id, notification_type, title, message) VALUES
('NOT001', 'U001', 'course_enrollment', 'Course Enrolled', 'You have successfully enrolled in Data Structures and Algorithms'),
('NOT002', 'U002', 'certificate_approved', 'Certificate Approved', 'Your certificate for AWS Solutions Architect has been verified'),
('NOT003', 'U001', 'reminder', 'Course Progress', 'Complete 15% more to finish Full Stack Web Development course');

-- =============================================
-- USEFUL QUERIES
-- =============================================

-- Get all courses enrolled by a user
-- SELECT * FROM Enrollments WHERE user_id = 'U001';

-- Get user progress statistics
-- SELECT 
--     user_id,
--     COUNT(*) as total_enrollments,
--     SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) as completed_courses,
--     AVG(progress_percentage) as average_progress
-- FROM Enrollments
-- WHERE user_id = 'U001'
-- GROUP BY user_id;

-- Get courses by semester for academic filtering
-- SELECT * FROM AcademicCourses WHERE semester = 3 AND college_domain = 'bitsathy.ac.in';

-- Get popular universal courses
-- SELECT * FROM UniversalCourses ORDER BY total_reviews DESC LIMIT 10;

-- Get user certificates
-- SELECT c.*, e.course_id, u.course_name 
-- FROM Certificates c
-- JOIN Enrollments e ON c.enrollment_id = e.enrollment_id
-- LEFT JOIN UniversalCourses u ON e.course_id = u.course_id
-- WHERE c.user_id = 'U001';

# Database Documentation

## Course Registration App - Database Guide

This document provides detailed information about the database schemas for the Course Registration App.

---

## Database Options

The application supports three database options:

1. **MySQL/PostgreSQL** - Traditional relational database
2. **MongoDB** - NoSQL document database
3. **Firebase Firestore** - Cloud-hosted NoSQL database

---

## Schema Files

- `schema_mysql.sql` - SQL schema for MySQL/PostgreSQL
- `schema_mongodb.js` - MongoDB schema with validation

---

## Database Entities

### 1. Users Collection/Table

Stores student/user information including authentication credentials and profile data.

**Fields:**
- `user_id` (Primary Key) - Unique user identifier
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Encrypted password
- `phone_number` - Phone number
- `phone_verified` - Phone verification status (boolean)
- `email_verified` - Email verification status (boolean)
- `linkedin_url` - LinkedIn profile URL (optional)
- `github_url` - GitHub profile URL (optional)
- `profile_image_url` - Profile picture URL (optional)
- `account_status` - Account status (active/blocked/suspended)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp

**Indexes:**
- email (unique)
- username (unique)
- user_id (unique, primary key)

---

### 2. Admins Collection/Table

Stores administrator information and permissions.

**Fields:**
- `admin_id` (Primary Key) - Unique admin identifier
- `username` - Admin username
- `email` - Admin email
- `password_hash` - Encrypted password
- `full_name` - Full name
- `role` - Admin role (super_admin/admin/moderator)
- `permissions` - Array/JSON of permissions
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

**Indexes:**
- email (unique)
- admin_id (unique, primary key)

---

### 3. AcademicCourses Collection/Table

Stores college/university academic courses.

**Fields:**
- `course_id` (Primary Key) - Unique course identifier
- `course_code` - Course code (e.g., CS301)
- `course_name` - Course name
- `description` - Course description
- `credits` - Number of credits
- `faculty_name` - Professor/Faculty name
- `semester` - Semester number (1-8)
- `year` - Year of study (1-4)
- `department` - Department name
- `college_domain` - College email domain for filtering
- `syllabus_url` - URL to syllabus document
- `prerequisites` - Array of prerequisite courses
- `is_active` - Active status (boolean)
- `created_by` - Admin ID who created
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- course_id (unique, primary key)
- course_code (unique)
- semester
- college_domain

---

### 4. UniversalCourses Collection/Table

Stores market-based courses from platforms like Udemy, Coursera, AWS, etc.

**Fields:**
- `course_id` (Primary Key) - Unique course identifier
- `course_name` - Course name
- `provider` - Course provider (Udemy/Coursera/AWS/Oracle/Pega/etc.)
- `description` - Course description
- `duration` - Course duration (e.g., "40 hours")
- `skill_level` - Skill level (Beginner/Intermediate/Advanced)
- `price` - Course price
- `rating` - Course rating (decimal)
- `total_reviews` - Number of reviews
- `course_url` - URL to course
- `thumbnail_url` - Course thumbnail image URL
- `category` - Course category
- `tags` - Array of tags
- `language` - Course language
- `is_active` - Active status (boolean)
- `created_by` - Admin ID who created
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- course_id (unique, primary key)
- provider
- skill_level
- category

---

### 5. Enrollments Collection/Table

Tracks course registrations and student progress.

**Fields:**
- `enrollment_id` (Primary Key) - Unique enrollment identifier
- `user_id` - Foreign key to Users
- `course_id` - Course identifier
- `course_type` - Type of course (academic/universal)
- `enrollment_date` - Date of enrollment
- `completion_status` - Status (enrolled/in_progress/completed/dropped)
- `progress_percentage` - Progress percentage (0-100)
- `last_accessed` - Last access timestamp
- `completion_date` - Course completion date
- `grade` - Course grade (optional)
- `certificate_issued` - Certificate issued status (boolean)

**Indexes:**
- enrollment_id (unique, primary key)
- user_id
- course_id
- Composite unique index on (user_id, course_id, course_type)

---

### 6. Certificates Collection/Table

Stores certificate information and verification data.

**Fields:**
- `certificate_id` (Primary Key) - Unique certificate identifier
- `enrollment_id` - Foreign key to Enrollments
- `user_id` - Foreign key to Users
- `course_id` - Course identifier
- `course_type` - Type of course (academic/universal)
- `certificate_url` - URL to certificate file
- `issue_date` - Certificate issue date
- `verification_code` - Unique verification code
- `is_verified` - Verification status (boolean)
- `verified_by` - Admin ID who verified
- `verified_at` - Verification timestamp

**Indexes:**
- certificate_id (unique, primary key)
- user_id
- verification_code (unique)

---

### 7. Notifications Collection/Table

Stores user notifications and alerts.

**Fields:**
- `notification_id` (Primary Key) - Unique notification identifier
- `user_id` - Foreign key to Users
- `notification_type` - Type (course_enrollment/course_completion/certificate_approved/system_update/reminder)
- `title` - Notification title
- `message` - Notification message
- `is_read` - Read status (boolean)
- `created_at` - Creation timestamp
- `read_at` - Read timestamp

**Indexes:**
- notification_id (unique, primary key)
- user_id
- is_read
- created_at (descending)

---

## Relationships

### One-to-Many Relationships:
- **Users → Enrollments**: One user can have many enrollments
- **Users → Certificates**: One user can have many certificates
- **Users → Notifications**: One user can have many notifications
- **Admins → AcademicCourses**: One admin can create many academic courses
- **Admins → UniversalCourses**: One admin can create many universal courses

### One-to-One Relationships:
- **Enrollments → Certificates**: One enrollment can have one certificate

---

## Sample Queries

### Get User's Enrolled Courses

**SQL:**
```sql
SELECT e.*, 
       COALESCE(ac.course_name, uc.course_name) as course_name,
       e.course_type
FROM Enrollments e
LEFT JOIN AcademicCourses ac ON e.course_id = ac.course_id AND e.course_type = 'academic'
LEFT JOIN UniversalCourses uc ON e.course_id = uc.course_id AND e.course_type = 'universal'
WHERE e.user_id = 'U001';
```

**MongoDB:**
```javascript
db.enrollments.find({ user_id: "U001" })
```

---

### Get User Progress Statistics

**SQL:**
```sql
SELECT 
    user_id,
    COUNT(*) as total_enrollments,
    SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) as completed_courses,
    AVG(progress_percentage) as average_progress
FROM Enrollments
WHERE user_id = 'U001'
GROUP BY user_id;
```

**MongoDB:**
```javascript
db.enrollments.aggregate([
  { $match: { user_id: "U001" } },
  { $group: {
      _id: "$user_id",
      total_enrollments: { $sum: 1 },
      completed_courses: {
        $sum: { $cond: [{ $eq: ["$completion_status", "completed"] }, 1, 0] }
      },
      average_progress: { $avg: "$progress_percentage" }
    }
  }
])
```

---

### Get Courses by Semester

**SQL:**
```sql
SELECT * 
FROM AcademicCourses 
WHERE semester = 3 AND college_domain = 'bitsathy.ac.in';
```

**MongoDB:**
```javascript
db.academic_courses.find({ 
  semester: 3, 
  college_domain: "bitsathy.ac.in" 
})
```

---

## Database Setup Instructions

### MySQL/PostgreSQL Setup

1. Create database:
```sql
CREATE DATABASE course_registration;
USE course_registration;
```

2. Import schema:
```bash
mysql -u root -p course_registration < database/schema_mysql.sql
```

### MongoDB Setup

1. Start MongoDB:
```bash
mongod
```

2. Open MongoDB shell:
```bash
mongo
```

3. Create database and import:
```javascript
use course_registration
// Copy and paste content from schema_mongodb.js
```

### Firebase Firestore Setup

1. Create Firebase project
2. Enable Firestore Database
3. Create collections based on MongoDB schema
4. Set up security rules
5. Configure indexes

---

## Security Considerations

1. **Password Storage**: Always use bcrypt or similar hashing
2. **Email Verification**: Implement email verification before activation
3. **Phone Verification**: Use OTP for phone verification
4. **Input Validation**: Validate all inputs on backend
5. **SQL Injection**: Use parameterized queries
6. **XSS Prevention**: Sanitize user inputs
7. **Access Control**: Implement role-based access control

---

## Backup Strategy

### MySQL/PostgreSQL:
```bash
# Backup
mysqldump -u root -p course_registration > backup.sql

# Restore
mysql -u root -p course_registration < backup.sql
```

### MongoDB:
```bash
# Backup
mongodump --db course_registration --out /backup/

# Restore
mongorestore --db course_registration /backup/course_registration/
```

---

## Performance Optimization

1. **Indexes**: Properly index frequently queried fields
2. **Pagination**: Implement pagination for large datasets
3. **Caching**: Use Redis for frequently accessed data
4. **Connection Pooling**: Use connection pooling for databases
5. **Query Optimization**: Optimize complex queries

---

## Migration Scripts

When modifying schema, create migration scripts to update existing databases without data loss.

Example migration (adding new field):
```sql
ALTER TABLE Users ADD COLUMN profile_completion_percentage INT DEFAULT 0;
```

---

This documentation should be updated whenever database schema changes are made.

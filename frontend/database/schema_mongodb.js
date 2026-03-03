// =============================================
// COURSE REGISTRATION APP - MongoDB SCHEMA
// Database: MongoDB / Firestore Compatible
// =============================================

// =============================================
// COLLECTION: users
// =============================================
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "username", "email", "password_hash", "phone_number"],
      properties: {
        user_id: {
          bsonType: "string",
          description: "Unique user identifier"
        },
        username: {
          bsonType: "string",
          description: "Username - required and unique"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email address - required and unique"
        },
        password_hash: {
          bsonType: "string",
          description: "Hashed password"
        },
        phone_number: {
          bsonType: "string",
          description: "Phone number - required"
        },
        phone_verified: {
          bsonType: "bool",
          description: "Phone verification status"
        },
        email_verified: {
          bsonType: "bool",
          description: "Email verification status"
        },
        linkedin_url: {
          bsonType: "string",
          description: "LinkedIn profile URL"
        },
        github_url: {
          bsonType: "string",
          description: "GitHub profile URL"
        },
        profile_image_url: {
          bsonType: "string",
          description: "Profile image URL"
        },
        account_status: {
          enum: ["active", "blocked", "suspended"],
          description: "Account status"
        },
        created_at: {
          bsonType: "date",
          description: "Account creation timestamp"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        last_login: {
          bsonType: "date",
          description: "Last login timestamp"
        }
      }
    }
  }
});

// Create indexes for users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "user_id": 1 }, { unique: true });

// =============================================
// COLLECTION: admins
// =============================================
db.createCollection("admins", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["admin_id", "username", "email", "password_hash"],
      properties: {
        admin_id: {
          bsonType: "string",
          description: "Unique admin identifier"
        },
        username: {
          bsonType: "string",
          description: "Admin username"
        },
        email: {
          bsonType: "string",
          description: "Admin email"
        },
        password_hash: {
          bsonType: "string",
          description: "Hashed password"
        },
        full_name: {
          bsonType: "string",
          description: "Full name"
        },
        role: {
          enum: ["super_admin", "admin", "moderator"],
          description: "Admin role"
        },
        permissions: {
          bsonType: "array",
          description: "List of permissions"
        },
        created_at: {
          bsonType: "date",
          description: "Account creation timestamp"
        },
        last_login: {
          bsonType: "date",
          description: "Last login timestamp"
        }
      }
    }
  }
});

db.admins.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "admin_id": 1 }, { unique: true });

// =============================================
// COLLECTION: academic_courses
// =============================================
db.createCollection("academic_courses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["course_id", "course_code", "course_name", "credits", "semester", "year", "college_domain"],
      properties: {
        course_id: {
          bsonType: "string",
          description: "Unique course identifier"
        },
        course_code: {
          bsonType: "string",
          description: "Course code - unique"
        },
        course_name: {
          bsonType: "string",
          description: "Course name"
        },
        description: {
          bsonType: "string",
          description: "Course description"
        },
        credits: {
          bsonType: "int",
          description: "Number of credits"
        },
        faculty_name: {
          bsonType: "string",
          description: "Faculty/Professor name"
        },
        semester: {
          bsonType: "int",
          description: "Semester number"
        },
        year: {
          bsonType: "int",
          description: "Year of study"
        },
        department: {
          bsonType: "string",
          description: "Department name"
        },
        college_domain: {
          bsonType: "string",
          description: "College email domain for filtering"
        },
        syllabus_url: {
          bsonType: "string",
          description: "URL to syllabus"
        },
        prerequisites: {
          bsonType: "array",
          description: "List of prerequisite courses"
        },
        is_active: {
          bsonType: "bool",
          description: "Course active status"
        },
        created_by: {
          bsonType: "string",
          description: "Admin ID who created the course"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update timestamp"
        }
      }
    }
  }
});

db.academic_courses.createIndex({ "course_id": 1 }, { unique: true });
db.academic_courses.createIndex({ "course_code": 1 }, { unique: true });
db.academic_courses.createIndex({ "semester": 1 });
db.academic_courses.createIndex({ "college_domain": 1 });

// =============================================
// COLLECTION: universal_courses
// =============================================
db.createCollection("universal_courses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["course_id", "course_name", "provider", "skill_level"],
      properties: {
        course_id: {
          bsonType: "string",
          description: "Unique course identifier"
        },
        course_name: {
          bsonType: "string",
          description: "Course name"
        },
        provider: {
          enum: ["Udemy", "Coursera", "AWS", "Oracle", "Pega", "edX", "LinkedIn Learning", "Other"],
          description: "Course provider"
        },
        description: {
          bsonType: "string",
          description: "Course description"
        },
        duration: {
          bsonType: "string",
          description: "Course duration"
        },
        skill_level: {
          enum: ["Beginner", "Intermediate", "Advanced"],
          description: "Skill level required"
        },
        price: {
          bsonType: "string",
          description: "Course price"
        },
        rating: {
          bsonType: "double",
          description: "Course rating"
        },
        total_reviews: {
          bsonType: "int",
          description: "Number of reviews"
        },
        course_url: {
          bsonType: "string",
          description: "URL to course"
        },
        thumbnail_url: {
          bsonType: "string",
          description: "Course thumbnail URL"
        },
        category: {
          bsonType: "string",
          description: "Course category"
        },
        tags: {
          bsonType: "array",
          description: "List of tags"
        },
        language: {
          bsonType: "string",
          description: "Course language"
        },
        is_active: {
          bsonType: "bool",
          description: "Course active status"
        },
        created_by: {
          bsonType: "string",
          description: "Admin ID who created the course"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update timestamp"
        }
      }
    }
  }
});

db.universal_courses.createIndex({ "course_id": 1 }, { unique: true });
db.universal_courses.createIndex({ "provider": 1 });
db.universal_courses.createIndex({ "skill_level": 1 });
db.universal_courses.createIndex({ "category": 1 });

// =============================================
// COLLECTION: enrollments
// =============================================
db.createCollection("enrollments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["enrollment_id", "user_id", "course_id", "course_type"],
      properties: {
        enrollment_id: {
          bsonType: "string",
          description: "Unique enrollment identifier"
        },
        user_id: {
          bsonType: "string",
          description: "User ID reference"
        },
        course_id: {
          bsonType: "string",
          description: "Course ID reference"
        },
        course_type: {
          enum: ["academic", "universal"],
          description: "Type of course"
        },
        enrollment_date: {
          bsonType: "date",
          description: "Enrollment date"
        },
        completion_status: {
          enum: ["enrolled", "in_progress", "completed", "dropped"],
          description: "Completion status"
        },
        progress_percentage: {
          bsonType: "int",
          minimum: 0,
          maximum: 100,
          description: "Progress percentage"
        },
        last_accessed: {
          bsonType: "date",
          description: "Last access timestamp"
        },
        completion_date: {
          bsonType: "date",
          description: "Completion date"
        },
        grade: {
          bsonType: "string",
          description: "Course grade"
        },
        certificate_issued: {
          bsonType: "bool",
          description: "Certificate issued status"
        }
      }
    }
  }
});

db.enrollments.createIndex({ "enrollment_id": 1 }, { unique: true });
db.enrollments.createIndex({ "user_id": 1 });
db.enrollments.createIndex({ "course_id": 1 });
db.enrollments.createIndex({ "user_id": 1, "course_id": 1, "course_type": 1 }, { unique: true });

// =============================================
// COLLECTION: certificates
// =============================================
db.createCollection("certificates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["certificate_id", "enrollment_id", "user_id", "course_id", "course_type"],
      properties: {
        certificate_id: {
          bsonType: "string",
          description: "Unique certificate identifier"
        },
        enrollment_id: {
          bsonType: "string",
          description: "Enrollment ID reference"
        },
        user_id: {
          bsonType: "string",
          description: "User ID reference"
        },
        course_id: {
          bsonType: "string",
          description: "Course ID reference"
        },
        course_type: {
          enum: ["academic", "universal"],
          description: "Type of course"
        },
        certificate_url: {
          bsonType: "string",
          description: "URL to certificate file"
        },
        issue_date: {
          bsonType: "date",
          description: "Certificate issue date"
        },
        verification_code: {
          bsonType: "string",
          description: "Unique verification code"
        },
        is_verified: {
          bsonType: "bool",
          description: "Verification status"
        },
        verified_by: {
          bsonType: "string",
          description: "Admin ID who verified"
        },
        verified_at: {
          bsonType: "date",
          description: "Verification timestamp"
        }
      }
    }
  }
});

db.certificates.createIndex({ "certificate_id": 1 }, { unique: true });
db.certificates.createIndex({ "user_id": 1 });
db.certificates.createIndex({ "verification_code": 1 }, { unique: true });

// =============================================
// COLLECTION: notifications
// =============================================
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["notification_id", "user_id", "notification_type", "title", "message"],
      properties: {
        notification_id: {
          bsonType: "string",
          description: "Unique notification identifier"
        },
        user_id: {
          bsonType: "string",
          description: "User ID reference"
        },
        notification_type: {
          enum: ["course_enrollment", "course_completion", "certificate_approved", "system_update", "reminder"],
          description: "Type of notification"
        },
        title: {
          bsonType: "string",
          description: "Notification title"
        },
        message: {
          bsonType: "string",
          description: "Notification message"
        },
        is_read: {
          bsonType: "bool",
          description: "Read status"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp"
        },
        read_at: {
          bsonType: "date",
          description: "Read timestamp"
        }
      }
    }
  }
});

db.notifications.createIndex({ "notification_id": 1 }, { unique: true });
db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "is_read": 1 });
db.notifications.createIndex({ "created_at": -1 });

// =============================================
// SAMPLE DATA INSERTION
// =============================================

// Insert Sample Admin
db.admins.insertOne({
  admin_id: "ADM001",
  username: "admin",
  email: "admin@bitsathy.ac.in",
  password_hash: "$2b$10$encrypted_password_hash",
  full_name: "System Administrator",
  role: "super_admin",
  permissions: ["create_course", "edit_course", "delete_course", "manage_users", "approve_certificates"],
  created_at: new Date(),
  last_login: new Date()
});

// Insert Sample Users
db.users.insertMany([
  {
    user_id: "U001",
    username: "janarthanan",
    email: "janarthanan.ad23@bitsathy.ac.in",
    password_hash: "$2b$10$encrypted_password_hash",
    phone_number: "+919876543210",
    phone_verified: true,
    email_verified: true,
    linkedin_url: "https://linkedin.com/in/janarthanan",
    github_url: "https://github.com/janarthanan",
    account_status: "active",
    created_at: new Date("2024-01-15"),
    updated_at: new Date(),
    last_login: new Date()
  },
  {
    user_id: "U002",
    username: "priya_sharma",
    email: "priya.ad23@bitsathy.ac.in",
    password_hash: "$2b$10$encrypted_password_hash",
    phone_number: "+919876543211",
    phone_verified: true,
    email_verified: true,
    account_status: "active",
    created_at: new Date("2024-01-16"),
    updated_at: new Date(),
    last_login: new Date()
  }
]);

// Insert Sample Academic Courses
db.academic_courses.insertMany([
  {
    course_id: "AC001",
    course_code: "CS301",
    course_name: "Data Structures and Algorithms",
    description: "Advanced data structures including trees, graphs, and algorithm analysis",
    credits: 4,
    faculty_name: "Dr. Rajesh Kumar",
    semester: 3,
    year: 2,
    department: "Computer Science",
    college_domain: "bitsathy.ac.in",
    prerequisites: ["CS201", "CS202"],
    is_active: true,
    created_by: "ADM001",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    course_id: "AC002",
    course_code: "CS302",
    course_name: "Database Management Systems",
    description: "Relational databases, SQL, normalization, and transaction management",
    credits: 3,
    faculty_name: "Prof. Priya Sharma",
    semester: 3,
    year: 2,
    department: "Computer Science",
    college_domain: "bitsathy.ac.in",
    prerequisites: ["CS201"],
    is_active: true,
    created_by: "ADM001",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Insert Sample Universal Courses
db.universal_courses.insertMany([
  {
    course_id: "UC001",
    course_name: "Complete Python Bootcamp",
    provider: "Udemy",
    description: "Learn Python like a Professional! Start from basics to creating your own applications",
    duration: "40 hours",
    skill_level: "Beginner",
    price: "Free",
    rating: 4.6,
    total_reviews: 125000,
    category: "Programming",
    tags: ["Python", "Programming", "Beginner"],
    language: "English",
    is_active: true,
    created_by: "ADM001",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    course_id: "UC002",
    course_name: "AWS Certified Solutions Architect",
    provider: "AWS",
    description: "Prepare for AWS certification with hands-on labs and real-world scenarios",
    duration: "60 hours",
    skill_level: "Intermediate",
    price: "$49.99",
    rating: 4.8,
    total_reviews: 85000,
    category: "Cloud Computing",
    tags: ["AWS", "Cloud", "Certification"],
    language: "English",
    is_active: true,
    created_by: "ADM001",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Insert Sample Enrollments
db.enrollments.insertMany([
  {
    enrollment_id: "EN001",
    user_id: "U001",
    course_id: "AC001",
    course_type: "academic",
    enrollment_date: new Date("2024-01-15"),
    completion_status: "in_progress",
    progress_percentage: 65,
    last_accessed: new Date(),
    certificate_issued: false
  },
  {
    enrollment_id: "EN002",
    user_id: "U001",
    course_id: "UC001",
    course_type: "universal",
    enrollment_date: new Date("2024-01-20"),
    completion_status: "in_progress",
    progress_percentage: 40,
    last_accessed: new Date(),
    certificate_issued: false
  }
]);

// Insert Sample Certificates
db.certificates.insertOne({
  certificate_id: "CERT001",
  enrollment_id: "EN005",
  user_id: "U002",
  course_id: "UC002",
  course_type: "universal",
  certificate_url: "https://certificates.example.com/CERT001.pdf",
  issue_date: new Date(),
  verification_code: "VERIFY-UC002-U002-2024",
  is_verified: true,
  verified_by: "ADM001",
  verified_at: new Date()
});

// Insert Sample Notifications
db.notifications.insertMany([
  {
    notification_id: "NOT001",
    user_id: "U001",
    notification_type: "course_enrollment",
    title: "Course Enrolled",
    message: "You have successfully enrolled in Data Structures and Algorithms",
    is_read: false,
    created_at: new Date()
  },
  {
    notification_id: "NOT002",
    user_id: "U002",
    notification_type: "certificate_approved",
    title: "Certificate Approved",
    message: "Your certificate for AWS Solutions Architect has been verified",
    is_read: true,
    created_at: new Date(),
    read_at: new Date()
  }
]);

// =============================================
// USEFUL QUERIES
// =============================================

// Get all courses enrolled by a user
// db.enrollments.find({ user_id: "U001" })

// Get user progress statistics
// db.enrollments.aggregate([
//   { $match: { user_id: "U001" } },
//   { $group: {
//       _id: "$user_id",
//       total_enrollments: { $sum: 1 },
//       completed_courses: {
//         $sum: { $cond: [{ $eq: ["$completion_status", "completed"] }, 1, 0] }
//       },
//       average_progress: { $avg: "$progress_percentage" }
//     }
//   }
// ])

// Get courses by semester
// db.academic_courses.find({ semester: 3, college_domain: "bitsathy.ac.in" })

// Get popular universal courses
// db.universal_courses.find().sort({ total_reviews: -1 }).limit(10)

// Get user certificates with course details
// db.certificates.aggregate([
//   { $match: { user_id: "U001" } },
//   { $lookup: {
//       from: "enrollments",
//       localField: "enrollment_id",
//       foreignField: "enrollment_id",
//       as: "enrollment"
//     }
//   }
// ])

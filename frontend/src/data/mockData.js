// Mock Academic Courses Data
export const academicCourses = [
  {
    id: 'AC001',
    courseCode: 'CS301',
    courseName: 'Data Structures and Algorithms',
    credits: 4,
    faculty: 'Dr. Rajesh Kumar',
    description: 'Advanced data structures including trees, graphs, and algorithm analysis',
    semester: 3,
    year: 2,
    type: 'academic'
  },
  {
    id: 'AC002',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    credits: 3,
    faculty: 'Prof. Priya Sharma',
    description: 'Relational databases, SQL, normalization, and transaction management',
    semester: 3,
    year: 2,
    type: 'academic'
  },
  {
    id: 'AC003',
    courseCode: 'CS303',
    courseName: 'Operating Systems',
    credits: 4,
    faculty: 'Dr. Arun Patel',
    description: 'Process management, memory management, and file systems',
    semester: 3,
    year: 2,
    type: 'academic'
  },
  {
    id: 'AC004',
    courseCode: 'CS304',
    courseName: 'Computer Networks',
    credits: 3,
    faculty: 'Prof. Meena Reddy',
    description: 'Network protocols, TCP/IP, routing, and network security',
    semester: 4,
    year: 2,
    type: 'academic'
  },
  {
    id: 'AC005',
    courseCode: 'CS401',
    courseName: 'Machine Learning',
    credits: 4,
    faculty: 'Dr. Suresh Babu',
    description: 'Introduction to ML algorithms, supervised and unsupervised learning',
    semester: 5,
    year: 3,
    type: 'academic'
  }
];

// Mock Universal Courses Data
export const universalCourses = [
  {
    id: 'UC001',
    courseName: 'Complete Python Bootcamp',
    provider: 'Udemy',
    description: 'Learn Python like a Professional! Start from basics to creating your own applications',
    duration: '40 hours',
    skillLevel: 'Beginner',
    price: 'Free',
    rating: 4.6,
    reviews: 125000,
    type: 'universal'
  },
  {
    id: 'UC002',
    courseName: 'AWS Certified Solutions Architect',
    provider: 'AWS',
    description: 'Prepare for AWS certification with hands-on labs and real-world scenarios',
    duration: '60 hours',
    skillLevel: 'Intermediate',
    price: '$49.99',
    rating: 4.8,
    reviews: 85000,
    type: 'universal'
  },
  {
    id: 'UC003',
    courseName: 'Full Stack Web Development',
    provider: 'Coursera',
    description: 'Master React, Node.js, MongoDB and build complete web applications',
    duration: '50 hours',
    skillLevel: 'Intermediate',
    price: 'Free',
    rating: 4.7,
    reviews: 95000,
    type: 'universal'
  },
  {
    id: 'UC004',
    courseName: 'Oracle Database Administrator',
    provider: 'Oracle',
    description: 'Become an Oracle DBA with comprehensive training on database administration',
    duration: '70 hours',
    skillLevel: 'Advanced',
    price: '$99.99',
    rating: 4.5,
    reviews: 45000,
    type: 'universal'
  },
  {
    id: 'UC005',
    courseName: 'Pega System Architect',
    provider: 'Pega',
    description: 'Learn Pega platform for building enterprise applications',
    duration: '45 hours',
    skillLevel: 'Intermediate',
    price: '$79.99',
    rating: 4.4,
    reviews: 32000,
    type: 'universal'
  },
  {
    id: 'UC006',
    courseName: 'Data Science Specialization',
    provider: 'Coursera',
    description: 'Complete data science program covering statistics, ML, and data visualization',
    duration: '80 hours',
    skillLevel: 'Advanced',
    price: 'Free',
    rating: 4.9,
    reviews: 150000,
    type: 'universal'
  },
  {
    id: 'UC007',
    courseName: 'React Native - The Practical Guide',
    provider: 'Udemy',
    description: 'Build cross-platform mobile apps with React Native',
    duration: '35 hours',
    skillLevel: 'Beginner',
    price: 'Free',
    rating: 4.7,
    reviews: 78000,
    type: 'universal'
  },
  {
    id: 'UC008',
    courseName: 'Docker & Kubernetes',
    provider: 'Udemy',
    description: 'Master containerization and orchestration with Docker and Kubernetes',
    duration: '25 hours',
    skillLevel: 'Intermediate',
    price: '$39.99',
    rating: 4.6,
    reviews: 55000,
    type: 'universal'
  }
];

// Mock User Data (for demonstration)
export const mockUsers = [
  {
    id: 'U001',
    username: 'janarthanan',
    email: 'janarthanan.ad23@bitsathy.ac.in',
    phone: '+91 9876543210',
    linkedin: 'https://linkedin.com/in/janarthanan',
    github: 'https://github.com/janarthanan',
    enrolledCourses: ['AC001', 'UC001', 'UC003'],
    completedCourses: [],
    certificates: []
  }
];

// Mock Enrolled Courses with Progress
export const enrolledCoursesData = [
  {
    courseId: 'AC001',
    progress: 65,
    status: 'ongoing',
    enrolledDate: '2024-01-15',
    lastAccessed: '2024-02-10'
  },
  {
    courseId: 'UC001',
    progress: 40,
    status: 'ongoing',
    enrolledDate: '2024-01-20',
    lastAccessed: '2024-02-08'
  },
  {
    courseId: 'UC003',
    progress: 85,
    status: 'ongoing',
    enrolledDate: '2024-01-10',
    lastAccessed: '2024-02-12'
  }
];

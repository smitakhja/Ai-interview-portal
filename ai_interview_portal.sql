CREATE DATABASE IF NOT EXISTS ai_interview_portal;
USE ai_interview_portal;

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 phone VARCHAR(20),
 profile_image VARCHAR(255),
 college VARCHAR(150),
 branch VARCHAR(100),
 graduation_year YEAR,
 role ENUM('Student','Admin') DEFAULT 'Student',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE resumes (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 resume_name VARCHAR(150),
 resume_file VARCHAR(255),
 resume_score DECIMAL(5,2),
 skills TEXT,
 strengths TEXT,
 weaknesses TEXT,
 ai_feedback TEXT,
 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mock_interviews (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 interview_type VARCHAR(100),
 difficulty ENUM('Easy','Medium','Hard'),
 total_questions INT,
 correct_answers INT,
 score DECIMAL(5,2),
 ai_feedback TEXT,
 interview_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE interview_questions(
 id INT AUTO_INCREMENT PRIMARY KEY,
 category VARCHAR(100),
 difficulty ENUM('Easy','Medium','Hard'),
 question TEXT,
 answer TEXT,
 explanation TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE technical_quizzes(
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(150),
 technology VARCHAR(100),
 difficulty ENUM('Easy','Medium','Hard'),
 total_questions INT,
 duration_minutes INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quiz_questions(
 id INT AUTO_INCREMENT PRIMARY KEY,
 quiz_id INT,
 question TEXT,
 option_a VARCHAR(255),
 option_b VARCHAR(255),
 option_c VARCHAR(255),
 option_d VARCHAR(255),
 correct_option CHAR(1),
 FOREIGN KEY (quiz_id) REFERENCES technical_quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quiz_results(
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 quiz_id INT,
 score DECIMAL(5,2),
 percentage DECIMAL(5,2),
 completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(quiz_id) REFERENCES technical_quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aptitude_tests(
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(150),
 category VARCHAR(100),
 duration INT,
 total_questions INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aptitude_questions(
 id INT AUTO_INCREMENT PRIMARY KEY,
 aptitude_test_id INT,
 question TEXT,
 option_a VARCHAR(255),
 option_b VARCHAR(255),
 option_c VARCHAR(255),
 option_d VARCHAR(255),
 correct_answer CHAR(1),
 FOREIGN KEY(aptitude_test_id) REFERENCES aptitude_tests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hr_questions(
 id INT AUTO_INCREMENT PRIMARY KEY,
 category VARCHAR(100),
 question TEXT,
 sample_answer TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ai_feedback(
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 interview_id INT,
 communication_score DECIMAL(5,2),
 confidence_score DECIMAL(5,2),
 technical_score DECIMAL(5,2),
 body_language_score DECIMAL(5,2),
 overall_score DECIMAL(5,2),
 strengths TEXT,
 improvements TEXT,
 recommendations TEXT,
 generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(interview_id) REFERENCES mock_interviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE progress_tracking(
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 interviews_completed INT DEFAULT 0,
 quizzes_completed INT DEFAULT 0,
 aptitude_completed INT DEFAULT 0,
 average_score DECIMAL(5,2),
 total_hours DECIMAL(6,2),
 level VARCHAR(50),
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE interview_history(
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 interview_type VARCHAR(100),
 score DECIMAL(5,2),
 duration INT,
 feedback_id INT NULL,
 completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(feedback_id) REFERENCES ai_feedback(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications(
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 title VARCHAR(150),
 message TEXT,
 is_read BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin(
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100),
 email VARCHAR(150) UNIQUE,
 password VARCHAR(255),
 role VARCHAR(50),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO admin(name,email,password,role)
VALUES('Administrator','admin@example.com','admin123','Super Admin');

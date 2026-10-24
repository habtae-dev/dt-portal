CREATE DATABASE IF NOT EXISTS debretaborPortal
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;
USE debretaborPortal;

-- WARNING: this script DROPS and recreates every table. Do not run it on a live database.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS users, news, tenders, vacancies, events, noticeboard, photo_gallery, video_gallery,
  places, doing_business, complaints, projects, council_contents, sub_cities, executive_contents, about_city,
  subscribers, city_facts;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Editor', 'Viewer') NOT NULL DEFAULT 'Editor',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    content_en TEXT NOT NULL,
    content_am TEXT NULL,
    category VARCHAR(100) DEFAULT 'General',
    images JSON DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    author_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_news_published (is_published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tenders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    description_en TEXT NULL,
    description_am TEXT NULL,
    document_url VARCHAR(500) DEFAULT NULL,
    submission_place VARCHAR(255) NOT NULL DEFAULT 'Debre Tabor City Admin, Main Building, Office No. 12',
    submission_instructions_en TEXT NULL,
    submission_instructions_am TEXT NULL,
    closing_date DATETIME NOT NULL,
    status ENUM('Open', 'Closed', 'Awarded') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenders_status_closing (status, closing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vacancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_code VARCHAR(50) NOT NULL UNIQUE,
    position_title_en VARCHAR(255) NOT NULL,
    position_title_am VARCHAR(255) NULL,
    department VARCHAR(150) NOT NULL,
    employment_type ENUM('Permanent', 'Contract') NOT NULL DEFAULT 'Permanent',
    quantity INT NOT NULL DEFAULT 1,
    description_en TEXT NULL,
    description_am TEXT NULL,
    qualifications_en TEXT NULL,
    qualifications_am TEXT NULL,
    document_url VARCHAR(500) DEFAULT NULL,
    application_place VARCHAR(255) NOT NULL DEFAULT 'Debre Tabor City Admin, HR Office, 1st Floor',
    deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vacancies_status_deadline (status, deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    description_en TEXT NULL,
    description_am TEXT NULL,
    event_date DATE NOT NULL,
    start_time TIME DEFAULT NULL,
    end_time TIME DEFAULT NULL,
    location_en VARCHAR(255) NOT NULL,
    location_am VARCHAR(255) NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_events_date_published (is_published, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE noticeboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    notice_body_en TEXT NOT NULL,
    notice_body_am TEXT NULL,
    target_audience VARCHAR(150) DEFAULT 'All Citizens',
    priority ENUM('Normal', 'Important', 'Urgent') NOT NULL DEFAULT 'Normal',
    document_url VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notice_active_expiry (is_active, expiry_date, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE photo_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    images JSON NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_photo_published (is_published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE video_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    description_en TEXT NULL,
    description_am TEXT NULL,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    category VARCHAR(100) DEFAULT 'General',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_video_published (is_published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_am VARCHAR(255) NULL,
    category ENUM('Park', 'Monument', 'Museum') NOT NULL,
    description_en TEXT NULL,
    description_am TEXT NULL,
    location_en VARCHAR(255) DEFAULT NULL,
    location_am VARCHAR(255) DEFAULT NULL,
    google_maps_url VARCHAR(500) DEFAULT NULL,
    images JSON NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_places_category (category, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doing_business (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    category ENUM('Investment Guide', 'Business License', 'Incentives', 'Opportunities') NOT NULL,
    content_en TEXT NOT NULL,
    content_am TEXT NULL,
    document_url VARCHAR(500) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_business_category (category, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_code VARCHAR(30) NOT NULL UNIQUE,
    citizen_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) DEFAULT NULL,
    department VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    attachment_url VARCHAR(500) DEFAULT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Pending',
    admin_notes TEXT DEFAULT NULL,
    handled_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaints_tracking (tracking_code),
    INDEX idx_complaints_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('Program', 'Project') NOT NULL DEFAULT 'Project',
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    description_en TEXT NULL,
    description_am TEXT NULL,
    status ENUM('Planned', 'Ongoing', 'Completed', 'On Hold') NOT NULL DEFAULT 'Planned',
    budget DECIMAL(15,2) DEFAULT NULL,
    location_en VARCHAR(255) DEFAULT NULL,
    location_am VARCHAR(255) DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    images JSON DEFAULT NULL,
    document_url VARCHAR(500) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_projects_category_status (category, status, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE council_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subcategory ENUM('overview', 'structure', 'speaker', 'standing_committees') NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    content_en TEXT NULL,
    content_am TEXT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    document_url VARCHAR(500) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_council_subcategory (subcategory, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sub_cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(150) NOT NULL,
    name_am VARCHAR(150) NULL,
    description_en TEXT NULL,
    description_am TEXT NULL,
    head_office_location_am VARCHAR(255) NULL,
    contact_phone VARCHAR(50) DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE executive_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('mayor', 'cabinet', 'structure', 'bureau') NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    person_name_en VARCHAR(150) DEFAULT NULL,
    person_name_am VARCHAR(150) DEFAULT NULL,
    position_en VARCHAR(150) DEFAULT NULL,
    position_am VARCHAR(150) DEFAULT NULL,
    content_en TEXT NULL,
    content_am TEXT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    document_url VARCHAR(500) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_executive_category (category, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE about_city (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('history', 'geography', 'community', 'city_administration') NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NULL,
    content_en TEXT NOT NULL,
    content_am TEXT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_about_category (category, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- E-mail subscribers (public footer / home-page form). unsubscribe_token is the secret in the unsubscribe link.
CREATE TABLE subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    language ENUM('en', 'am') NOT NULL DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    unsubscribe_token CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subscribers_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- "City at a glance" cards shown above Latest Updates on the home page (area, population, ...). Edited in the dashboard.
CREATE TABLE city_facts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label_en VARCHAR(100) NOT NULL,
    label_am VARCHAR(100) NULL,
    value_en VARCHAR(100) NOT NULL,
    value_am VARCHAR(100) NULL,
    note_en VARCHAR(150) NULL,
    note_am VARCHAR(150) NULL,
    icon VARCHAR(16) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city_facts_order (is_published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No sample or test content is inserted. Starter facts (population: ESA 2021 projection; elevation: 2,706 m).
-- Add the city AREA (and anything else) in the dashboard under "City Facts" once you have the official figure.
INSERT INTO city_facts (label_en, label_am, value_en, value_am, note_en, note_am, icon, sort_order) VALUES
('Population', 'ህዝብ ብዛት', '119,176', '119,176', 'ESA 2021 projection', 'የስታቲስቲክስ አገልግሎት ግምት (2021)', '👥', 1),
('Elevation', 'ከፍታ', '2,706 m', '2,706 ሜ', 'above sea level', 'ከባሕር ጠለል በላይ', '⛰️', 2);

-- No users are seeded: create the first admin with `npm run create-admin` (backend/).

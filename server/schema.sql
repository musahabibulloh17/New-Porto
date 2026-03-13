-- PostgreSQL schema for portfolio_db
-- Jalankan di dalam database yang sudah dibuat:
--   CREATE DATABASE portfolio_db;
--   \c portfolio_db

-- Table projects
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description_short VARCHAR(500) NOT NULL DEFAULT '',
  color       VARCHAR(20)  NOT NULL DEFAULT '#333333',
  mockup      VARCHAR(20)  NOT NULL DEFAULT 'phones'
              CHECK (mockup IN ('phones', 'browser', 'laptop', 'phone')),
  number_color VARCHAR(50) NOT NULL DEFAULT 'rgba(0,0,0,0.25)',
  image_url   VARCHAR(500) DEFAULT NULL,
  description_long TEXT    DEFAULT NULL,
  features    JSONB        DEFAULT '[]',
  developed_by JSONB       DEFAULT '[]',
  links       JSONB        DEFAULT '[]',
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Default data
INSERT INTO projects (name, description_short, color, mockup, number_color, description_long, features, developed_by, links, sort_order)
VALUES
(
  'TRAVLO',
  'Accessible Travel for people with special needs',
  '#a8d5a2',
  'phones',
  'rgba(76, 175, 80, 0.25)',
  'Travlo is a mobile application designed to make traveling more accessible for people with special needs. The app provides tailored recommendations, accessibility info, and real-time assistance.',
  '["Accessibility-focused travel recommendations", "Real-time navigation assistance", "Community reviews & ratings", "Multi-language support"]',
  '["Musa Habibulloh (UI/UX Design)"]',
  '[]',
  1
),
(
  'SANORA',
  'Website Design for a premium safety wear brand',
  '#5a8f5a',
  'browser',
  'rgba(46, 125, 50, 0.25)',
  'A complete website redesign for Sanora Wear, a premium safety wear brand. The design focuses on trust, professionalism, and easy product discovery.',
  '["Modern & clean UI design", "Product catalog with filtering", "Responsive across all devices"]',
  '["Musa Habibulloh (UI/UX Design)"]',
  '[]',
  2
),
(
  'FACTORY FLOW',
  'Factory Management System',
  '#e74c3c',
  'laptop',
  'rgba(244, 67, 54, 0.25)',
  'Factory Flow is a comprehensive factory management system designed to streamline production workflows, inventory tracking, and worker management.',
  '["Production workflow management", "Real-time inventory tracking", "Worker scheduling & management", "Analytics dashboard"]',
  '["Musa Habibulloh (UI/UX Design)"]',
  '[]',
  3
),
(
  'AGODA',
  'Re-design for the AGODA Website',
  '#c0392b',
  'phone',
  'rgba(211, 47, 47, 0.25)',
  'A UI/UX redesign concept for the Agoda booking platform, focusing on improved user experience and a more modern visual language.',
  '["Simplified booking flow", "Improved search & filter UX", "Modern visual redesign"]',
  '["Musa Habibulloh (UI/UX Design)"]',
  '[]',
  4
),
(
  'BALANCIFY',
  'Work-life balance, simplified and smart',
  '#5b9bd5',
  'phones',
  'rgba(21, 101, 192, 0.25)',
  'Balancify is a smart app that helps users maintain a healthy work-life balance through task scheduling, wellness tracking, and mindful reminders.',
  '["Smart task scheduling", "Wellness & mood tracking", "Mindful break reminders", "Weekly balance reports"]',
  '["Musa Habibulloh (UI/UX Design)"]',
  '[]',
  5
)
ON CONFLICT DO NOTHING;

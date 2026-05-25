CREATE DATABASE IF NOT EXISTS nba_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nba_vault;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  phone VARCHAR(60) DEFAULT '',
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caps (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  team VARCHAR(150) NOT NULL,
  year INT NOT NULL,
  `condition` VARCHAR(50) NOT NULL DEFAULT 'good',
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  image LONGTEXT NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  userName VARCHAR(150) NOT NULL,
  items LONGTEXT NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('pending','repacking','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  paymentMethod ENUM('cash','gcash') NOT NULL DEFAULT 'cash',
  deliveryType ENUM('pickup','cod') NOT NULL DEFAULT 'pickup',
  address TEXT NOT NULL,
  phone VARCHAR(60) NOT NULL,
  notes TEXT,
  date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact (
  id INT NOT NULL PRIMARY KEY,
  shopName VARCHAR(150) NOT NULL,
  ownerName VARCHAR(150) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  email VARCHAR(190) NOT NULL,
  address TEXT NOT NULL,
  facebook VARCHAR(255) DEFAULT '',
  instagram VARCHAR(255) DEFAULT '',
  messengerUsername VARCHAR(255) DEFAULT '',
  bio TEXT
);

INSERT INTO users (id, name, email, password, role, phone, address)
VALUES ('admin1', 'Admin', 'admin@caps.ph', 'admin123', 'admin', '', '')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

INSERT INTO caps (id, name, team, year, `condition`, price, description, image, featured)
VALUES
('1', 'Bulls Dynasty Snapback', 'Chicago Bulls', 1996, 'near-mint', 18000, 'Original 1996 championship-era Bulls snapback in excellent collector condition.', 'bulls', 1),
('2', 'Lakers Showtime Fitted', 'Los Angeles Lakers', 1988, 'excellent', 25000, 'Purple and gold fitted cap inspired by the Showtime Lakers era.', 'lakers', 1),
('3', 'Celtics Garden Classic', 'Boston Celtics', 1992, 'good', 14500, 'Vintage green Celtics cap with clean embroidery and classic fit.', 'celtics', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), team = VALUES(team), year = VALUES(year), `condition` = VALUES(`condition`), price = VALUES(price), description = VALUES(description), image = VALUES(image), featured = VALUES(featured);

INSERT INTO contact (id, shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio)
VALUES (1, 'Caps Vault Manila', 'Juan Dela Cruz', '+63 917 123 4567', 'seller@capsvault.ph', 'Makati City, Metro Manila', 'facebook.com/capsvaultmanila', '@capsvaultmanila', 'capsvaultmanila', 'Collector of authentic vintage NBA caps in the Philippines.')
ON DUPLICATE KEY UPDATE shopName = VALUES(shopName), ownerName = VALUES(ownerName), phone = VALUES(phone), email = VALUES(email), address = VALUES(address), facebook = VALUES(facebook), instagram = VALUES(instagram), messengerUsername = VALUES(messengerUsername), bio = VALUES(bio);

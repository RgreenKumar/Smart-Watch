-- Media Jungle OTT - PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobnum VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    profile_image BYTEA,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    categories VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    video_title VARCHAR(500) NOT NULL,
    moviename VARCHAR(500),
    year VARCHAR(20),
    duration VARCHAR(50),
    main_video_duration VARCHAR(50),
    trailer_duration VARCHAR(50),
    rating VARCHAR(20),
    certificate_number VARCHAR(100),
    certificate_name VARCHAR(100),
    video_access_type BOOLEAN DEFAULT FALSE,
    description TEXT,
    production_company VARCHAR(255),
    language VARCHAR(100),
    vidofilename VARCHAR(500),
    videotrailerfilename VARCHAR(500),
    thumbnail BYTEA,
    video_banner BYTEA,
    video_file BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS video_categories (
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, category_id)
);

CREATE TABLE IF NOT EXISTS cast_crew (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image BYTEA
);

CREATE TABLE IF NOT EXISTS video_cast (
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    cast_id INTEGER REFERENCES cast_crew(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, cast_id)
);

CREATE TABLE IF NOT EXISTS video_banners (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audio_files (
    id SERIAL PRIMARY KEY,
    audio_title VARCHAR(500) NOT NULL,
    audio_file_name VARCHAR(500),
    audio_file BYTEA,
    audio_duration VARCHAR(50),
    movie_name VARCHAR(255),
    rating VARCHAR(20),
    description TEXT,
    production_company VARCHAR(255),
    certificate_name VARCHAR(100),
    certificate_no VARCHAR(100),
    paid BOOLEAN DEFAULT FALSE,
    thumbnail_base64 TEXT,
    banner_image BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audio_categories (
    audio_id INTEGER REFERENCES audio_files(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (audio_id, category_id)
);

CREATE TABLE IF NOT EXISTS audio_banners (
    id SERIAL PRIMARY KEY,
    audio_id INTEGER REFERENCES audio_files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favourite_audio (
    id SERIAL PRIMARY KEY,
    audio_id INTEGER REFERENCES audio_files(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(audio_id, user_id)
);

CREATE TABLE IF NOT EXISTS watch_later (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_title VARCHAR(500),
    UNIQUE(video_id, user_id)
);

CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS playlist_audios (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    audio_id INTEGER REFERENCES audio_files(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    UNIQUE(playlist_id, audio_id)
);

CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    planname VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS tenures (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    tenure_name VARCHAR(255) NOT NULL,
    months INTEGER NOT NULL,
    discount INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_features (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    notimage VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255),
    icon TEXT,
    logo TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS razorpay_settings (
    id SERIAL PRIMARY KEY,
    razorpay_key VARCHAR(255),
    razorpay_secret_key VARCHAR(255)
);

-- Insert default site settings
INSERT INTO site_settings (site_name, icon) VALUES ('Media Jungle', '') ON CONFLICT DO NOTHING;

-- Insert default features
INSERT INTO features (feature_name) SELECT 'HD Streaming' WHERE NOT EXISTS (SELECT 1 FROM features WHERE feature_name = 'HD Streaming');
INSERT INTO features (feature_name) SELECT '4K Streaming' WHERE NOT EXISTS (SELECT 1 FROM features WHERE feature_name = '4K Streaming');
INSERT INTO features (feature_name) SELECT 'Download' WHERE NOT EXISTS (SELECT 1 FROM features WHERE feature_name = 'Download');
INSERT INTO features (feature_name) SELECT 'Multiple Devices' WHERE NOT EXISTS (SELECT 1 FROM features WHERE feature_name = 'Multiple Devices');

-- Insert default categories
INSERT INTO categories (categories) SELECT 'Action' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Action');
INSERT INTO categories (categories) SELECT 'Comedy' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Comedy');
INSERT INTO categories (categories) SELECT 'Drama' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Drama');
INSERT INTO categories (categories) SELECT 'Horror' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Horror');
INSERT INTO categories (categories) SELECT 'Romance' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Romance');
INSERT INTO categories (categories) SELECT 'Thriller' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Thriller');
INSERT INTO categories (categories) SELECT 'Music' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories = 'Music');

-- Insert default plans
INSERT INTO plans (planname, amount) SELECT 'Basic', 99.00 WHERE NOT EXISTS (SELECT 1 FROM plans WHERE planname = 'Basic');
INSERT INTO plans (planname, amount) SELECT 'Premium', 199.00 WHERE NOT EXISTS (SELECT 1 FROM plans WHERE planname = 'Premium');
INSERT INTO plans (planname, amount) SELECT 'Family', 299.00 WHERE NOT EXISTS (SELECT 1 FROM plans WHERE planname = 'Family');

-- Insert default tenures
INSERT INTO tenures (plan_id, tenure_name, months, discount) SELECT 1, 'Monthly', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM tenures WHERE plan_id = 1 AND tenure_name = 'Monthly');
INSERT INTO tenures (plan_id, tenure_name, months, discount) SELECT 1, 'Yearly', 12, 20 WHERE NOT EXISTS (SELECT 1 FROM tenures WHERE plan_id = 1 AND tenure_name = 'Yearly');
INSERT INTO tenures (plan_id, tenure_name, months, discount) SELECT 2, 'Monthly', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM tenures WHERE plan_id = 2 AND tenure_name = 'Monthly');
INSERT INTO tenures (plan_id, tenure_name, months, discount) SELECT 2, 'Yearly', 12, 25 WHERE NOT EXISTS (SELECT 1 FROM tenures WHERE plan_id = 2 AND tenure_name = 'Yearly');

-- Link features to plans
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 1, 1, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 1 AND feature_id = 1);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 1, 3, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 1 AND feature_id = 3);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 2, 1, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 2 AND feature_id = 1);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 2, 2, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 2 AND feature_id = 2);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 2, 3, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 2 AND feature_id = 3);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 2, 4, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 2 AND feature_id = 4);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 3, 1, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 3 AND feature_id = 1);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 3, 2, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 3 AND feature_id = 2);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 3, 3, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 3 AND feature_id = 3);
INSERT INTO plan_features (plan_id, feature_id, active) SELECT 3, 4, true WHERE NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = 3 AND feature_id = 4);

-- Insert default razorpay settings
INSERT INTO razorpay_settings (razorpay_key, razorpay_secret_key) SELECT 'rzp_test_demo', 'demo_secret_key' WHERE NOT EXISTS (SELECT 1 FROM razorpay_settings LIMIT 1);

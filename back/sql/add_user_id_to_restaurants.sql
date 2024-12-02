-- Add user_id column to restaurants table
ALTER TABLE restaurants ADD COLUMN user_id INT;
ALTER TABLE restaurants ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Update existing test restaurant to link with test restaurant user
UPDATE restaurants r
JOIN users u ON u.role = 'restaurant' AND u.email = 'restaurant@test.com'
SET r.user_id = u.id
WHERE r.name = 'Test Restaurant';

-- Make user_id NOT NULL after updating existing data
ALTER TABLE restaurants MODIFY COLUMN user_id INT NOT NULL; 
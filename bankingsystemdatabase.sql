-- Create the database
CREATE DATABASE banking_system;

-- Connect to the banking_system database
\c banking_system;

-- Create the customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    balance NUMERIC(10, 2)
);

-- Create the transfers table
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    amount NUMERIC(10, 2),
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES customers(id),
    FOREIGN KEY (receiver_id) REFERENCES customers(id)
);

-- Insert dummy data into the customers table
INSERT INTO customers (name, email, balance) VALUES
('Ananya', 'ananya@example.com', 49300.00),
('Babita', 'babita@example.com', 29900.00),
('Chetna', 'chetna@example.com', 60900.00),
('Dhruv', 'dhruv@example.com', 80900.00),
('Gungun', 'gungun@example.com', 25100.00),
('Harshit', 'harshit@example.com', 64900.00),
('Ishika', 'ishika@example.com', 41100.00),
('Kavya', 'kavya@example.com', 35000.00),
('Lavanya', 'lavanya@example.com', 45900.00),
('Pearl', 'pearl@example.com', 59000.00);
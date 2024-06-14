In this project, I built a full-stack web application for user authentication and task management using Node.js, Express.js, MySQL, and JavaScript. 
The backend handles user registration, login/logout sessions, and nn the frontend, used forms and interactive elements to communicate with the server and display user-specific data and messages. 
The database schema ensures data integrity and supports the application's functionality, allowing users to securely register, log in, manage tasks, and perform CRUD operations on their tasks.

The database schema used in the project consists of two main tables: users and tasks.

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);



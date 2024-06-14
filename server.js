
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');


const app = express();
const connection = require('./db/db');


app.use(express.static(path.join(__dirname, 'core')));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

const checkAuth = (req, res, next) => {
    if (req.cookies.userId) {
        next();
    } else {
        res.status(401).send('You are not logged in');
    }
};


app.post('/signup', (req, res) => {
    const { email, password } = req.body;


    const checkemailQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkemailQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).send('Error checking email');
        }

        if (results.length > 0) {
            return res.status(400).send('email already registered');
        } else {
            const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            connection.query(insertQuery, [email, password], (err, result) => {
                if (err) {
                    console.error('Error creating account:', err);
                    return res.status(500).send('Error creating account');
                }
                res.status(200).send('Account created successfully');
            });
        }



    });
});






app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).send('Error logging in');
        }

        if (results.length > 0) {
            const userId = results[0].id;
            res.cookie('userId', userId, { httpOnly: true });
            res.status(200).json({ message: 'Login successful', redirectTo: '/task.html' });
        } else {
            res.status(401).send('Invalid email or password');
        }
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('userId');
    res.status(200).send('Logged out successfully');
});

app.post('/add-task', checkAuth, (req, res) => {
    const { title, description } = req.body;
    const userId = req.cookies.userId;
    const query = 'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)';
    connection.query(query, [userId, title, description], (err, result) => {
        if (err) {
            res.status(500).send('Error adding task');
        } else {
            res.status(200).send('Task added successfully');
        }
    });
});

app.get('/tasks', checkAuth, (req, res) => {
    const userId = req.cookies.userId;
    const query = 'SELECT * FROM tasks WHERE user_id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching tasks');
        } else {
            res.status(200).json(results);
        }
    });
});

app.put('/update-task/:id', checkAuth, (req, res) => {
    const userId = req.cookies.userId;
    const taskId = req.params.id;
    const { title, description } = req.body;

    const query = 'UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?';
    connection.query(query, [title, description, taskId, userId], (err, result) => {
        if (err) {
            res.status(500).send('Error updating task');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Task not found or you do not have permission to edit this task');
        } else {
            res.status(200).send('Task updated successfully');
        }
    });
});

app.delete('/delete-task/:id', checkAuth, (req, res) => {
    const userId = req.cookies.userId;
    const taskId = req.params.id;

    const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
    connection.query(query, [taskId, userId], (err, result) => {
        if (err) {
            res.status(500).send('Error deleting task');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Task not found or you do not have permission to delete this task');
        } else {
            res.status(200).send('Task deleted successfully');
        }
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

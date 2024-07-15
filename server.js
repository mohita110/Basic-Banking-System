const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 3000; // Changed port from 5432 to 3000 to avoid conflict with PostgreSQL

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '0000',  // Replace with your PostgreSQL password
    database: 'Banking_system',
    port: 5432 // Default PostgreSQL port
});

pool.connect((error) => {
    if (error) throw error;
    console.log('Connected to PostgreSQL Database.');
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Mohita.html'));
});

app.get('/customers', (req, res) => {
    pool.query('SELECT * FROM customers', (error, results) => {
        if (error) throw error;
        res.json(results.rows);
    });
});

app.get('/customer/:id', (req, res) => {
    const customerId = req.params.id;
    pool.query('SELECT * FROM customers WHERE id = $1', [customerId], (error, result) => {
        if (error) throw error;
        res.json(result.rows[0]);
    });
});

app.post('/transfer', (req, res) => {
    const { fromId, toId, transferAmount } = req.body;

    pool.connect((error, client, done) => {
        if (error) throw error;

        client.query('BEGIN', (err) => {
            if (err) return rollback(client, done, err, res);

            client.query('SELECT balance FROM customers WHERE id = $1', [fromId], (err, results) => {
                if (err) return rollback(client, done, err, res);

                const senderCurrentBalance = results.rows[0].balance;
                if (senderCurrentBalance < transferAmount) {
                    return rollback(client, done, 'Insufficient funds.', res);
                }

                client.query('UPDATE customers SET balance = balance - $1 WHERE id = $2', [transferAmount, fromId], (err) => {
                    if (err) return rollback(client, done, err, res);

                    client.query('UPDATE customers SET balance = balance + $1 WHERE id = $2', [transferAmount, toId], (err) => {
                        if (err) return rollback(client, done, err, res);

                        client.query('INSERT INTO transfers (sender_id, receiver_id, amount) VALUES ($1, $2, $3)', [fromId, toId, transferAmount], (err) => {
                            if (err) return rollback(client, done, err, res);

                            client.query('COMMIT', (err) => {
                                if (err) return rollback(client, done, err, res);

                                done();
                                res.send('Transfer completed successfully.');
                            });
                        });
                    });
                });
            });
        });
    });
});

function rollback(client, done, err, res) {
    client.query('ROLLBACK', (rollbackErr) => {
        done();
        if (rollbackErr) {
            return res.status(500).send('Error rolling back transaction: ' + rollbackErr);
        }
        res.status(400).send(err);
    });
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

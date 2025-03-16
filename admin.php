<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #6a11cb;
            color: white;
            text-align: center;
        }
        table {
            width: 70%;
            margin: auto;
            border-collapse: collapse;
            background: white;
            color: black;
            border-radius: 10px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ccc;
        }
        th {
            background: #ff512f;
            color: white;
        }
        a {
            color: red;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <h2>Admin Panel - User List</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Action</th>
        </tr>

        <?php
        $conn = new mysqli("localhost", "root", "", "your_database");

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $result = $conn->query("SELECT * FROM users");

        while ($row = $result->fetch_assoc()) {
            echo "<tr>
                    <td>{$row['id']}</td>
                    <td>{$row['username']}</td>
                    <td>{$row['email']}</td>
                    <td>{$row['created_at']}</td>
                    <td><a href='delete.php?id={$row['id']}'>Delete</a></td>
                </tr>";
        }

        $conn->close();
        ?>
    </table>

</body>
</html>

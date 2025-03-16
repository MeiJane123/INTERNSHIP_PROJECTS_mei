<?php
session_start();
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #6a11cb;
            color: white;
            text-align: center;
            margin-top: 50px;
        }
        .logout {
            background: #ff512f;
            color: white;
            padding: 10px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
        }
    </style>
</head>
<body>

    <h2>Welcome, <?php echo $_SESSION["username"]; ?>!</h2>
    <p>You are now logged in.</p>
    <a class="logout" href="logout.php">Logout</a>

</body>
</html>

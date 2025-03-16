<?php
// Connect to database
$conn = new mysqli("localhost", "root", "", "your_database");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get user input
$username = "new_user";
$email = "newuser@gmail.com";
$password = password_hash("securepassword", PASSWORD_DEFAULT); // Hash password for security

// Insert query
$sql = "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $email, $password);

if ($stmt->execute()) {
    echo "User added successfully!";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>

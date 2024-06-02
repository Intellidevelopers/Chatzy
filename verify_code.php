<?php
include 'config/function.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $phone_number = $_POST['phone_number'];
    $verification_code = $_POST['verification_code'];

    $stmt = $conn->prepare("SELECT id FROM users WHERE phone_number = ? AND verification_code = ?");
    $stmt->bind_param("ss", $phone_number, $verification_code);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->close();

        $update_stmt = $conn->prepare("UPDATE users SET is_verified = TRUE WHERE phone_number = ?");
        $update_stmt->bind_param("s", $phone_number);
        if ($update_stmt->execute()) {
            echo "Phone number verified successfully.";
        } else {
            echo "Error: " . $update_stmt->error;
        }
        $update_stmt->close();
    } else {
        echo "Invalid verification code.";
    }
    
    $stmt->close();
    $conn->close();
}
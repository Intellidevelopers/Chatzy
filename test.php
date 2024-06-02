<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phone Verification</title>
</head>
<body>
    <h1>Phone Verification</h1>

    <h2>Send Verification Code</h2>
    <form action="send_verification.php" method="POST">
        <label for="phone_number">Phone Number:</label>
        <input type="text" id="phone_number" name="phone_number" required>
        <button type="submit">Send Code</button>
    </form>

    <h2>Verify Code</h2>
    <form action="verify_code.php" method="POST">
        <label for="phone_number">Phone Number:</label>
        <input type="text" id="phone_number" name="phone_number" required>
        <label for="verification_code">Verification Code:</label>
        <input type="text" id="verification_code" name="verification_code" required>
        <button type="submit">Verify Code</button>
    </form>
</body>
</html>

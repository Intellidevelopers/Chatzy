<?php
        include 'config/function.php';
        require 'vendor/autoload.php';
        
        use Vonage\Client;
        use Vonage\Client\Credentials\Basic;
        use Vonage\SMS\Message\SMS;
        
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $phone_number = $_POST['phone_number'];
            $phone_number = preg_replace('/[^0-9]/', '', $phone_number); // Remove non-numeric characters
            
            if (substr($phone_number, 0, 1) === '0') {
                $phone_number = substr($phone_number, 1);
            }
        
            $phone_number = '234' . $phone_number; // Prepend country code for Nigeria
        
            $verification_code = rand(100000, 999999);
        
            $stmt = $conn->prepare("INSERT INTO users (phone_number, verification_code) VALUES (?, ?)");
            $stmt->bind_param("ss", $phone_number, $verification_code);
            
            if ($stmt->execute()) {
                // Send SMS using Vonage
                $basic  = new Basic('caf92b28', 'kah8PsqKbu5tBYOB');
                $client = new Client($basic);
        
                try {
                    $response = $client->sms()->send(
                        new SMS($phone_number, 'Chatzy', "Your verification code is $verification_code")
                    );
                    echo "Verification code sent.";
                } catch (Exception $e) {
                    echo "Failed to send verification code: " . $e->getMessage();
                }
            } else {
                echo "Error: " . $stmt->error;
            }
            
            $stmt->close();
            $conn->close();
        }
        
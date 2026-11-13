namespace EcommerceAPI.Helpers;

public static class EmailTemplates
{
    public static string VerificationEmail(
        string userName,
        string verificationLink)
    {
        return $@"
<!DOCTYPE html>

<html>

<head>

<meta charset='UTF-8'>

<style>

body{{
background:#f5f5f5;
font-family:Arial;
padding:40px;
}}

.card{{
max-width:600px;
margin:auto;
background:white;
border-radius:12px;
padding:40px;
}}

.btn{{
display:inline-block;
padding:14px 28px;
background:#000;
color:#fff!important;
text-decoration:none;
border-radius:8px;
font-weight:bold;
}}

.footer{{
margin-top:30px;
font-size:13px;
color:#777;
}}

</style>

</head>

<body>

<div class='card'>

<h2>Hello {userName},</h2>

<p>
Thank you for creating your account.
</p>

<p>
Please verify your email by clicking the button below.
</p>

<br>

<a class='btn' href='{verificationLink}'>
Verify Email
</a>

<br><br>

<p>
If the button doesn't work, copy this link:
</p>

<p>
{verificationLink}
</p>

<div class='footer'>

Ecommerce Store

</div>

</div>

</body>

</html>";
    }
    public static string ResetPasswordEmail(
    string userName,
    string resetLink)
    {
        return $@"
<!DOCTYPE html>

<html>

<head>

<meta charset='UTF-8'>

<style>

body{{
background:#f4f4f4;
font-family:Arial;
padding:40px;
}}

.card{{
background:#fff;
max-width:600px;
margin:auto;
padding:40px;
border-radius:12px;
}}

.btn{{
display:inline-block;
padding:14px 28px;
background:#dc2626;
color:white!important;
text-decoration:none;
border-radius:8px;
font-weight:bold;
}}

.footer{{
margin-top:30px;
font-size:13px;
color:#777;
}}

</style>

</head>

<body>

<div class='card'>

<h2>Hello {userName},</h2>

<p>

We received a request to reset your password.

</p>

<p>

Click the button below to create a new password.

</p>

<br>

<a href='{resetLink}' class='btn'>

Reset Password

</a>

<br><br>

<p>

If the button doesn't work, copy this link.

</p>

<p>

{resetLink}

</p>

<div class='footer'>

This link will expire in 30 minutes.

</div>

</div>

</body>

</html>";
    }
}

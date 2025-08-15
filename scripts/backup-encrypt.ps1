param(
  [Parameter(Mandatory=$true)][string]$InputFile,
  [Parameter(Mandatory=$true)][string]$Password,
  [Parameter(Mandatory=$false)][string]$OutputFile
)

if (-not (Test-Path $InputFile)) { throw "InputFile not found: $InputFile" }
if (-not $OutputFile) { $OutputFile = "$InputFile.enc" }

Add-Type -AssemblyName System.Security

$salt = New-Object byte[] 16
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($salt)

$derive = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Password, $salt, 100000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
$key = $derive.GetBytes(32)
$iv = New-Object byte[] 16
$rng.GetBytes($iv)

$aes = [System.Security.Cryptography.Aes]::Create()
$aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
$aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
$aes.Key = $key
$aes.IV = $iv

$encryptor = $aes.CreateEncryptor()

try {
  $inStream = [System.IO.File]::OpenRead($InputFile)
  $outStream = [System.IO.File]::Open($OutputFile, [System.IO.FileMode]::Create)

  # Write header: SALT(16) + IV(16)
  $outStream.Write($salt, 0, $salt.Length)
  $outStream.Write($iv, 0, $iv.Length)

  $cryptoStream = New-Object System.Security.Cryptography.CryptoStream($outStream, $encryptor, [System.Security.Cryptography.CryptoStreamMode]::Write)
  $inStream.CopyTo($cryptoStream)
  $cryptoStream.FlushFinalBlock()
}
finally {
  if ($cryptoStream) { $cryptoStream.Dispose() }
  if ($encryptor) { $encryptor.Dispose() }
  if ($aes) { $aes.Dispose() }
  if ($inStream) { $inStream.Dispose() }
  if ($outStream) { $outStream.Dispose() }
  if ($rng) { $rng.Dispose() }
}

Write-Output "Encrypted: $OutputFile"



param(
  [Parameter(Mandatory=$true)][string]$InputFile,
  [Parameter(Mandatory=$true)][string]$Password,
  [Parameter(Mandatory=$false)][string]$OutputZip
)

if (-not (Test-Path $InputFile)) { throw "InputFile not found: $InputFile" }
if (-not $OutputZip) { $OutputZip = [System.IO.Path]::ChangeExtension($InputFile, $null) }
if (-not $OutputZip.ToLower().EndsWith('.zip')) { $OutputZip = "$OutputZip.zip" }

Add-Type -AssemblyName System.Security

$inStream = [System.IO.File]::OpenRead($InputFile)
try {
  # Read header: SALT(16) + IV(16)
  $salt = New-Object byte[] 16
  $bytesRead = $inStream.Read($salt, 0, 16)
  if ($bytesRead -ne 16) { throw 'Invalid encrypted file header (salt)' }
  $iv = New-Object byte[] 16
  $bytesRead = $inStream.Read($iv, 0, 16)
  if ($bytesRead -ne 16) { throw 'Invalid encrypted file header (iv)' }

  $derive = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Password, $salt, 100000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  $key = $derive.GetBytes(32)

  $aes = [System.Security.Cryptography.Aes]::Create()
  $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
  $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
  $aes.Key = $key
  $aes.IV = $iv
  $decryptor = $aes.CreateDecryptor()

  $outStream = [System.IO.File]::Open($OutputZip, [System.IO.FileMode]::Create)
  try {
    $cryptoStream = New-Object System.Security.Cryptography.CryptoStream($inStream, $decryptor, [System.Security.Cryptography.CryptoStreamMode]::Read)
    $cryptoStream.CopyTo($outStream)
  } finally {
    if ($cryptoStream) { $cryptoStream.Dispose() }
    if ($outStream) { $outStream.Dispose() }
    if ($decryptor) { $decryptor.Dispose() }
    if ($aes) { $aes.Dispose() }
  }
} finally {
  if ($inStream) { $inStream.Dispose() }
}

Write-Output "Decrypted: $OutputZip"

param(
  [Parameter(Mandatory=$true)][string]$InputFile,
  [Parameter(Mandatory=$true)][string]$Password,
  [Parameter(Mandatory=$false)][string]$OutputFile
)

if (-not (Test-Path $InputFile)) { throw "InputFile not found: $InputFile" }
if (-not $OutputFile) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
  if ($base -like '*.zip') { $base = $base.Substring(0, $base.Length - 4) }
  $OutputFile = (Join-Path ([System.IO.Path]::GetDirectoryName($InputFile)) ($base + '.zip'))
}

Add-Type -AssemblyName System.Security

$inStream = [System.IO.File]::OpenRead($InputFile)
try {
  # Read header: SALT(16) + IV(16)
  $salt = New-Object byte[] 16
  $iv = New-Object byte[] 16
  $bytesRead = $inStream.Read($salt, 0, 16)
  if ($bytesRead -ne 16) { throw 'Corrupt file: salt missing' }
  $bytesRead = $inStream.Read($iv, 0, 16)
  if ($bytesRead -ne 16) { throw 'Corrupt file: iv missing' }

  $derive = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Password, $salt, 100000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  $key = $derive.GetBytes(32)

  $aes = [System.Security.Cryptography.Aes]::Create()
  $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
  $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
  $aes.Key = $key
  $aes.IV = $iv
  $decryptor = $aes.CreateDecryptor()

  $outStream = [System.IO.File]::Open($OutputFile, [System.IO.FileMode]::Create)
  try {
    $cryptoStream = New-Object System.Security.Cryptography.CryptoStream($inStream, $decryptor, [System.Security.Cryptography.CryptoStreamMode]::Read)
    $cryptoStream.CopyTo($outStream)
  } finally {
    if ($cryptoStream) { $cryptoStream.Dispose() }
    if ($outStream) { $outStream.Dispose() }
  }
} finally {
  if ($decryptor) { $decryptor.Dispose() }
  if ($aes) { $aes.Dispose() }
  if ($inStream) { $inStream.Dispose() }
}

Write-Output "Decrypted to: $OutputFile"



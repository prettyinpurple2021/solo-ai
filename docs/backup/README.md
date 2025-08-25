# SoloBoss Backup and Restore

This doc captures how to back up and restore the project, including an encrypted snapshot for disaster recovery.

## Latest Snapshot

- Encrypted download (temporary host): https://0x0.st/8FRz.zip.enc
- Local path (on your machine): `C:\Users\prett\Desktop\ai agent profile images\soloboss-backup\solo-boss-backup-20250811-191254.zip.enc`
- Password: `c5e9730bfdaa470daf8eeefd4528dc9d`
- SHA256: `0338C8FE5DE019ED33E19DB3B9262A63454EC400663FCE68572B473A1142B6B4`

Store the password and checksum securely. Anyone with both can decrypt the snapshot.

## Create a New Backup (unencrypted)

From the project root:

```powershell
$ts=Get-Date -Format yyyyMMdd-HHmmss
$items=Get-ChildItem -Path . -Force -Name -Exclude node_modules,.next,coverage,out,.turbo,.git
Compress-Archive -Path $items -DestinationPath "..\solo-boss-backup-$ts.zip" -Force
```

## Encrypt a Backup

```powershell
# Encrypt an existing backup zip
powershell -ExecutionPolicy Bypass -File .\scripts\backup-encrypt.ps1 -InputFile "..\solo-boss-backup-YYYYMMDD-HHMMSS.zip" -Password "<your-strong-password>"
```

This produces `..\solo-boss-backup-YYYYMMDD-HHMMSS.zip.enc`. Compute a checksum:

```powershell
(Get-FileHash -Path "..\solo-boss-backup-YYYYMMDD-HHMMSS.zip.enc" -Algorithm SHA256).Hash
```

## Restore (Decrypt + Extract)

```powershell
# Decrypt
powershell -ExecutionPolicy Bypass -File .\scripts\backup-decrypt.ps1 -InputFile "solo-boss-backup-YYYYMMDD-HHMMSS.zip.enc" -Password "<password>" -OutputZip "solo-boss-backup-YYYYMMDD-HHMMSS.zip"

# Extract
Expand-Archive -Path "solo-boss-backup-YYYYMMDD-HHMMSS.zip" -DestinationPath "restored" -Force
```

## Notes

- Exclusions: `node_modules`, `.next`, `coverage`, `out`, `.turbo`, `.git` are excluded from the archive.
- Security: Keep the password and SHA256 hash in a secure manager (e.g., 1Password). The link on 0x0.st is temporary; upload to your Drive for long-term storage.
- Automation: We can wire a scheduled job to create, encrypt, and upload snapshots automatically.

# SoloBoss Backup & Restore

This doc explains how to use the encrypted snapshot backup.

## Latest backup (example)
- Encrypted file: `C:\Users\prett\Desktop\ai agent profile images\soloboss-backup\solo-boss-backup-20250811-191254.zip.enc`
- SHA256: `0338C8FE5DE019ED33E19DB3B9262A63454EC400663FCE68572B473A1142B6B4`
- Password: stored securely by you (do not commit passwords)
- Temporary download (if still valid): `https://0x0.st/8FRz.zip.enc`

## Create a fresh backup (Windows PowerShell)
1) From the project root:
```powershell
$ts=Get-Date -Format yyyyMMdd-HHmmss
$items=Get-ChildItem -Path . -Force -Name -Exclude node_modules,.next,coverage,out,.turbo,.git
Compress-Archive -Path $items -DestinationPath "..\solo-boss-backup-$ts.zip" -Force
```

2) Encrypt it (AES, password-based):
```powershell
# Generate a random password (plaintext)
$pwdPlain = [guid]::NewGuid().ToString('N')
# Encrypt backup
powershell -ExecutionPolicy Bypass -File .\scripts\backup-encrypt.ps1 -InputFile "..\solo-boss-backup-$ts.zip" -Password $pwdPlain -OutputFile "..\solo-boss-backup-$ts.zip.enc"
# Save $pwdPlain in a secure place
```

Or directly with your own password:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-encrypt.ps1 -InputFile "..\solo-boss-backup-<STAMP>.zip" -Password <YOUR_PASSWORD> -OutputFile "..\solo-boss-backup-<STAMP>.zip.enc"
```

3) Compute checksum for integrity (optional):
```powershell
Get-FileHash -Path "..\solo-boss-backup-<STAMP>.zip.enc" -Algorithm SHA256
```

## Restore (decrypt)
Given `solo-boss-backup-<STAMP>.zip.enc` and the password:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-decrypt.ps1 -InputFile "..\solo-boss-backup-<STAMP>.zip.enc" -Password <YOUR_PASSWORD>
# Produces: ..\solo-boss-backup-<STAMP>.zip
```
Then unzip:
```powershell
Expand-Archive -Path "..\solo-boss-backup-<STAMP>.zip" -DestinationPath "..\restore-<STAMP>" -Force
```

## Upload (quick fallback)
Upload to a temporary host (0x0.st):
```powershell
$enc=(Get-ChildItem -Path .. -Filter solo-boss-backup-*.zip.enc | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
curl.exe -F file=@"$enc" https://0x0.st
```

## Notes
- Never commit passwords or unencrypted backups.
- Prefer storing the password in a secrets manager.
- For Google Drive automation, create a service account with Drive API and provide a folder ID.



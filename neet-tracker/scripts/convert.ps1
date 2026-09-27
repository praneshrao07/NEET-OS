Add-Type -AssemblyName System.Drawing

$src = "C:\Users\child\.gemini\antigravity-ide\brain\a3f6a2ad-f825-4b25-bffb-95ca21895ad1\neet_os_icon_1790343086129.jpg"
if (!(Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}
if (!(Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$bmp.Save("build\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Also create multiple icon sizes for high quality ICO
$sizes = @(16, 32, 48, 64, 128, 256)
foreach ($size in $sizes) {
    $resized = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($resized)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($bmp, 0, 0, $size, $size)
    $resized.Save("build\icon_${size}.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $resized.Dispose()
}

$bmp.Dispose()
Write-Host "PNG icons created successfully!"

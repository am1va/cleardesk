param([switch]$NoBrowser)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$nodePath=Join-Path $root '.project-tools/node-v24.21.0-win-x64/node.exe'
$backend=Join-Path $root 'cleardesk-online'
$frontend=Join-Path $root 'cleardesk-github'
$env:TEMP=Join-Path $root '.project-tools/tmp';$env:TMP=$env:TEMP
Push-Location $backend
try{
 & $nodePath scripts/build.mjs;if($LASTEXITCODE){throw 'Backend build failed.'}
 & $nodePath scripts/prepare-github.mjs --preview;if($LASTEXITCODE){throw 'Frontend preparation failed.'}
}finally{Pop-Location}
function Read-Page([string]$url){try{return Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2}catch{return $null}}
function Start-PreviewProcess([string]$script,[string]$directory,[string]$prefix){
 $process=Start-Process -FilePath $nodePath -ArgumentList ('"'+$script+'"') -WorkingDirectory $directory -WindowStyle Hidden -PassThru -RedirectStandardOutput ($prefix+'-output.log') -RedirectStandardError ($prefix+'-error.log')
 $process.Id | Set-Content ($prefix+'.pid')
}
if(-not (Read-Page 'http://localhost:8086/app.js')){Start-PreviewProcess (Join-Path $backend 'scripts/local-server.mjs') $backend (Join-Path $backend 'verification/server')}
if(-not (Read-Page 'http://localhost:8087/cleardesk/')){Start-PreviewProcess (Join-Path $frontend 'scripts/preview.mjs') $frontend (Join-Path $frontend 'verification/preview')}
for($attempt=0;$attempt -lt 30;$attempt++){
 $api=Read-Page 'http://localhost:8086/app.js';$site=Read-Page 'http://localhost:8087/cleardesk/'
 if($api -and $site -and $api.Content.Contains('openRemoteDemo') -and $site.Content.Contains('http://localhost:8086')){
  Write-Output 'ClearDesk GitHub-style preview: http://localhost:8087/cleardesk/'
  if(-not $NoBrowser){Start-Process 'http://localhost:8087/cleardesk/'}
  exit 0
 }
 Start-Sleep -Milliseconds 100
}
throw 'The preview did not serve the current build. Check the preview logs and restart the owned preview process; do not stop unrelated servers.'

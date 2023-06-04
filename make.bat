call npx webpack
xcopy /e /y .\src\static .\docs
type src\misc\LICENSE_APPEND.txt >> docs\main.js.LICENSE.txt

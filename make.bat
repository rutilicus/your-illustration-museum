call npx webpack
xcopy /e /y .\src\static .\build
type src\misc\LICENSE_APPEND.txt >> build\main.js.LICENSE.txt

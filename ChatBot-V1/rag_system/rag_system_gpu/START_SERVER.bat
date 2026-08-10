@echo off
title RGreenMart RAG Server
cd /d "C:\Users\kuppubalaji Gs\Desktop\claud_rag-chat-bot\rag_system"
call venv\Scripts\activate.bat
echo.
echo  Open browser: http://localhost:5000
echo  Ctrl+C to stop
echo.
python run.py
pause

#!/bin/bash
cd /home/kavia/workspace/code-generation/chatgpt-web-interface-45979-45988/chatgpt_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


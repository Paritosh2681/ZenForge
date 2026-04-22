FROM ollama/ollama:latest

# Pre-pull gemma:2b model during build
RUN nohup ollama serve > /dev/null 2>&1 & \
    sleep 10 && \
    ollama pull gemma:2b && \
    pkill ollama || true

EXPOSE 11434
ENTRYPOINT ["ollama", "serve"]

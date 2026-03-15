FROM python:3.10-slim

WORKDIR /app

# Install OS dependencies for some Python packages (e.g. gcc, g++, cmake for llama-cpp-python)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    cmake \
    libpq-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first for caching
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy everything necessary
COPY backend/ ./backend/
COPY datasets/ ./datasets/
COPY models/ ./models/

# Expose port
EXPOSE 8001

# Run the app from backend directory
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

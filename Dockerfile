# Use a lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Ensure Python files are compiled
RUN python -m compileall .

# Expose port
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && gunicorn study_planner.wsgi:application --bind 0.0.0.0:8000"]

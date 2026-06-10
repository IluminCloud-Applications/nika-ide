# ── Production single image (status frontend + automation backend) ───────────
# Builds the React status page and serves it statically from FastAPI, so the
# whole app ships as ONE image. Run with:
#   docker build -t my-automation . && docker run -p 8742:8742 my-automation

# Stage 1 — build the frontend status page
FROM node:20-slim AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2 — backend + bundled static frontend
FROM python:3.10-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend /frontend/dist ./static

EXPOSE 8742

CMD ["python", "main.py"]

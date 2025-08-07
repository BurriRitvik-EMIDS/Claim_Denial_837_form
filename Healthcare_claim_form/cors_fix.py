# Add this to your FastAPI server to fix CORS issues

from fastapi.middleware.cors import CORSMiddleware

# Add this after creating your FastAPI app instance


def add_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",  # Vite dev server
            "http://127.0.0.1:5173",  # Vite dev server alternative
            "http://localhost:3000",  # React dev server
            "http://127.0.0.1:3000",  # React dev server alternative
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

# Usage example:
# from fastapi import FastAPI
# from cors_fix import add_cors_middleware
#
# app = FastAPI()
# add_cors_middleware(app)

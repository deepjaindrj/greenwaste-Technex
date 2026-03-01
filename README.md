# Green Horizon

## Overview
Green Horizon is a comprehensive web application designed to promote sustainable waste management, carbon tracking, and ESG (Environmental, Social, and Governance) initiatives. The platform provides tools for citizens, businesses, and municipalities to monitor, analyze, and improve their environmental impact through data-driven insights and gamified engagement.

## Introduction
Green Horizon aims to bridge the gap between technology and sustainability by offering a unified platform for:
- Waste collection tracking
- Carbon footprint analysis
- ESG market participation
- Community engagement and rewards
- Real-time analytics and reporting

The application leverages modern web technologies, geospatial mapping, and AI-powered waste detection to empower users at every level to make informed, eco-friendly decisions.

## Pages
- **Landing**: Introduction to the platform, mission, and onboarding.
- **Dashboard**: Central hub for user analytics, notifications, and quick actions.
- **Analytics**: Visualizations and insights into waste, carbon, and ESG data.
- **Business**: Tools and reports for business users to track and improve sustainability metrics.
- **Carbon**: Carbon footprint tracking and reduction suggestions.
- **Carbon Market**: Participate in carbon credit trading and offsetting.
- **Collection Tracker**: Monitor waste collection schedules and history.
- **Esg Market**: Engage in ESG-related activities and investments.
- **Leaderboard**: Gamified rankings for individuals and organizations.
- **Municipal**: Municipality-specific dashboards and controls.
- **Predict**: AI-powered waste type and volume prediction (YOLOv6 segmentation).
- **Reports**: Generate and download sustainability and compliance reports.
- **Request Pickup**: Schedule waste pickups for citizens and businesses.
- **Rewards**: Earn and redeem points for sustainable actions.
- **Scan**: AI-based waste scanning and classification.
- **Settings**: User profile and application settings.
- **Truck Driver**: Dedicated interface for waste collection drivers.
- **NotFound**: 404 error page for undefined routes.

## Features (in short)
- Real-time waste collection tracking and analytics
- Carbon footprint monitoring and reduction tools
- ESG market participation and reporting
- AI-powered waste detection and classification (YOLOv6)
- Gamified rewards and leaderboard system
- Municipality and business-specific dashboards
- Supabase integration for authentication and data storage
- Interactive geospatial mapping (Leaflet)
- Responsive, modern UI with Tailwind CSS

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Leaflet
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: YOLOv6 segmentation (PyTorch)
- **Testing**: Vitest
- **Other**: PostCSS, ESLint

## Architecture
```
Frontend (React + Vite + Tailwind)
	|
	|---> API Layer (Supabase, FastAPI endpoints)
	|
Backend (FastAPI, Python)
	|---> AI/ML Service (YOLOv6 waste detection)
	|---> Database (Supabase/PostgreSQL)

- The frontend communicates with Supabase for authentication and data, and with FastAPI for advanced features and AI/ML endpoints.
- Waste images are uploaded to the backend, processed by the YOLOv6 model, and results are returned to the frontend.
- All user, waste, and carbon data is stored and managed in Supabase.
```

---

For setup instructions, contribution guidelines, and more, please refer to the individual documentation files or contact the maintainers.

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

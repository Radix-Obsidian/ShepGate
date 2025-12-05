@echo off
set AGENT_PROFILE_ID=cmis63c8x0001fjx8nt1mi3ic
set DATABASE_URL=postgresql://neondb_owner:npg_WZ2xpXVYh5ga@ep-sweet-mode-afdr0lue-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
cd /d "C:\Users\autre\OneDrive\Desktop\Projects (Golden Sheep AI)\ShepGate"
npx tsx scripts/mcp-host.ts

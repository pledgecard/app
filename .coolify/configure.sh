#!/bin/bash

# Coolify Build Script for PledgeCard Uganda

echo "🔨 Building PledgeCard Uganda..."

# Install dependencies
npm ci

# Build the application
npm run build

echo "✅ Build complete!"

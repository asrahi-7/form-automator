FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Generate Prisma Client and Build the Next.js app
RUN npx prisma generate
RUN npm run build

# Expose the web port
EXPOSE 3000
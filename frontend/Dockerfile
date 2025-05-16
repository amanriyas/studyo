FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# Ensure devDependencies (including Vite) are installed
RUN npm install --legacy-peer-deps 

COPY . ./

RUN npm run build

ENV HOST=0.0.0.0

EXPOSE 5173

CMD ["npm", "start"]
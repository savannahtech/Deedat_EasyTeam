FROM node:16

WORKDIR /src



COPY package*.json ./
RUN npm install


COPY . .
RUN ls
RUN npx prisma generate
RUN npm run build
EXPOSE 5000

CMD ["node", "dist/app.js"]

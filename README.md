# MediBed - Hospital Bed Management System

## Local Setup

Follow these exact steps to run the MediBed application locally:

1. **Start the database and Redis instances via Docker**
   ```bash
   docker compose up -d
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```

3. **Push the Prisma schema to the database**
   ```bash
   npm run db:push
   ```

4. **Seed the database with initial fake data**
   ```bash
   npm run db:seed
   ```

5. **Start the Next.js development server**
   ```bash
   npm run dev
   ```

You can also view the database via Prisma studio by running:
```bash
npm run db:studio
```

## Environment Variables
Ensure `.env.local` is present in the root containing your `DATABASE_URL` and `REDIS_URL` pointing to localhost appropriately.

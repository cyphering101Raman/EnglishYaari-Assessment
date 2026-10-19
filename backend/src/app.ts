import express, { Application, Request, Response, NextFunction } from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express()

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Main API routes
app.use('/', routes);

// Global centralized error handler
app.use(errorHandler);

export default app;

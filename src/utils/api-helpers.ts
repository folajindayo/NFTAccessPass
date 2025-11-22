import type { NextApiResponse } from 'next';

export const sendSuccess = <T>(res: NextApiResponse, data: T) => {
  return res.status(200).json(data);
};

export const sendError = (res: NextApiResponse, error: string, statusCode = 500) => {
  return res.status(statusCode).json({ error });
};


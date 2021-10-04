import { NextFunction, Request, Response } from "express";
import { verify, decode } from "jsonwebtoken";

export async function authentication(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).end();
  }

  const [, token] = authHeader.split(" ");

  try {
    verify(token, process.env.JWT_SECRET);

    const { sub: userId } = decode(token);

    request.userId = String(userId);

    return next();
  } catch (err) {
    return response.status(401).end();
  }
}

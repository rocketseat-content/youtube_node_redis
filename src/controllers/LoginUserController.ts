import { compare } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { createConnection } from "../postgres";
import { setRedis } from "../redisConfig";

type User = {
  username: string;
  password: string;
  name: string;
  id: string;
};

export class LoginUserController {
  async handle(request: Request, response: Response) {
    const { username, password } = request.body;

    const clientConnection = await createConnection();

    const { rows } = await clientConnection.query(
      `SELECT * FROM USERS WHERE USERNAME  = $1 LIMIT 1`,
      [username]
    );

    if (!rows[0]) {
      return response.status(401).end();
    }

    const user: User = rows[0];

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return response.status(401).end();
    }

    const token = sign({}, process.env.JWT_SECRET, {
      subject: user.id,
    });

    // user-${idUser}
    await setRedis(`user-${user.id}`, JSON.stringify(user));

    return response.json(token);
  }
}

import { Response, Request } from 'express';

export type Handle<T = any> = (req: Request, res: Response) => T;

interface MessageInput {
  type: string;
  message: string;
}

export class Message {
  constructor() {}

  message({ type = 'log', message }: MessageInput) {
    (console as any)[type](message);
  }
}

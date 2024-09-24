interface CustomErrorProps {
  status: number;
  message: string;
}

class CustomError extends Error {
  status: number;

  constructor(data: CustomErrorProps) {
    const { message, status } = data;

    super(message);

    this.status = status;
  }
}

export { CustomError };

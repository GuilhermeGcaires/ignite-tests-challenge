import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateTransferUseCase } from './CreateTransferUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { receiver_id } = request.params
    const { amount, description } = request.body;
    const { id: sender_id } = request.user;


    const splittedPath = request.originalUrl.split('/')
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const transfer = await createTransfer.execute({

    });

    return response.status(201).json(transfer);
  }
}

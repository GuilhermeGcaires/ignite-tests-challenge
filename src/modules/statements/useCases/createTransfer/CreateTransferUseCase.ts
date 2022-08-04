import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ITransferDTO } from "./ICreateTransferDTO";


@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ receiver_id, sender_id, amount, description }: ITransferDTO) {
    const sendUser = await this.usersRepository.findById(sender_id);

    if (!sendUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiverUser = await this.usersRepository.findById(receiver_id)

    if (!receiverUser) {
      throw new CreateStatementError.UserNotFound();
    }


    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds()
    }
  

    await this.statementsRepository.create({
    user_id: sendUser.id as string,
    type: OperationType.WITHDRAW,
    amount,
    description
  });

  const transferStatement = await this.statementsRepository.create({
    user_id: receiverUser.id as string,
    sender_id: sendUser.id as string,
    type: OperationType.TRANFER,
    amount,
    description
  })

    return transferStatement;
  }
}

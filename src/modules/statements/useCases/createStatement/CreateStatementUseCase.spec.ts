import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { OperationType } from "../../entities/Statement"
import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository


describe("Create a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a new deposit", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "123456"
    })

    const statement = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 250,
      description: "Depositing 250$"
    })
    expect(statement).toHaveProperty("id")
  })

  it("should be able to create a new withdraw", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "123456"
    })

    await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 250,
      description: "Depositing 250$"
    })

    const statement = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdrawing 100$"
    })
    expect(statement).toHaveProperty("id")
    expect(statement.amount).toBe(100)
  })

  it("should be able to create a new withdraw when if user has insuficient funds", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "123456"
    })

    await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: "Depositing 50$"
    })

    await expect(createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdrawing 100$"
    })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("should not be able to create any statement if user does not exist", () => {
    expect(createStatementUseCase.execute({
      user_id: "inexistent" as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdrawing 100$"
    })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../../entities/Statement"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let getStatementOperationUseCase: GetStatementOperationUseCase


describe("Create a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to get statement operation", async () => {
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

    const statementDetails = await getStatementOperationUseCase.execute({
      user_id: token.user.id as string,
      statement_id: statement.id as string,
    })

    expect(statementDetails).toHaveProperty("id")
  })

  it("should not be able to get a inexistent statement operation", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user1@email.com",
      password: "123456"
    }

    await createUserUseCase.execute(user);


    const token = await authenticateUserUseCase.execute({
      email: "user1@email.com",
      password: "123456"
    })

    const statement = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 250,
      description: "Depositing 250$"
    })

    await expect(getStatementOperationUseCase.execute({
      user_id: token.user.id as string,
      statement_id: "inexistent"
    })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })

  it("should not be able to get statement operation of an inexistent user", async () => {
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

    await expect(getStatementOperationUseCase.execute ({
      user_id: "inexistent user",
      statement_id: statement.id as string,
    }))
    .rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })
})
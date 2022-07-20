import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "123456"
    })
    expect(response).toHaveProperty("token");
  })
  it("should not be able to authenticate a non-existent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@fail.com",
        password: "12345"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
  it("should not be able to authenticate incorrect password", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User",
        email: "user@wrongpassword.com",
        password: "fail"
      })
      await authenticateUserUseCase.execute({
        email: "user@wrongpassword.com",
        password: "test"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
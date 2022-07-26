import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "12345"
    })

    expect(user).toHaveProperty("id");
  })
  it("should not be able to create two users with same email", async () => {
    expect(async () => {

      await createUserUseCase.execute({
        name: "Test user1",
        email: "email@email.com",
        password: "12345"
      })
      await createUserUseCase.execute({
        name: "Test user2",
        email: "email@email.com",
        password: "54321"
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })
  
})
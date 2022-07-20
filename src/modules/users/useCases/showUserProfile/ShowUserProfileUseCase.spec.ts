import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let showUserProfileUseCase: ShowUserProfileUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to show user profile", async () => {
    const user: ICreateUserDTO = ({
      name: "Test User",
      email: "test@email.com",
      password: "123456"
    }) 
    await createUserUseCase.execute(user)
    const jwt = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })
    const userProfile = await showUserProfileUseCase.execute(jwt.user.id as string);

    expect(userProfile).toHaveProperty("id");
  })

  it("should not be able to show profile when user does not exist.", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("iddoesnotexist")
    })
    .rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
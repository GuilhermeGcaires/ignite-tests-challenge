import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";

let connection: Connection

describe("Create User Controller" , () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app).post('/api/v1/users/').send({
      name: "user",
      email: "user@test.com",
      password: "password"
    })
    expect(response.status).toBe(201)
  })
})
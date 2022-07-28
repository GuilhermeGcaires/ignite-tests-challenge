import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid"
import request from "supertest";

import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection
describe("Create Category Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
        values('${id}', 'admin', 'admin@admin.com', '${password}', 'now()', 'now()')
      `
    )
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin"
    })
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  })

  it("should not be able to authenticate user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "incorrect"
    })

    expect(response.status).toBe(401);
  })

  it("should not be able to authenticate user with incorrect email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@incorrect.com",
      password: "admin"
    })

    expect(response.status).toBe(401);
  })
})
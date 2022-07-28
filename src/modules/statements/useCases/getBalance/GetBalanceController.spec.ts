import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@admin.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const statementDeposit = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 250,
      description: "Testing"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const statementWithdraw = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 50,
      description: "Testing withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).get("/api/v1/statements/balance")
    .send()
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(response.statusCode).toBe(200);
    expect(response.body.balance).toBe(200);
  })
})
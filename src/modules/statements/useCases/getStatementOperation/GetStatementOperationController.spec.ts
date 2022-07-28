import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Statement Operation", () => {
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

  it("should be able to check a statement operation type", async () => {
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

    const response = await request(app).get(`/api/v1/statements/${statementDeposit.body.id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(response.status).toBe(200);
    expect(response.body.type).toBe('deposit')
  })

  it("should not be able to get the statement from a non existent id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  })
})
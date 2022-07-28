import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("", () => {
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

    const response = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 250,
      description: "Testing"
    }).set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  })

  it("should be able to create a new withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 50,
      description: "Testing withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(50);
  })

  it("should not able to create a new withdraw statement without enough funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 400,
      description: "Testing"
    }).set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(400);
  })
})
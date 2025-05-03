const request = require("supertest");
const express = require("express");
const ticketsRouter = require("./tickets");

const app = express();
app.use(express.json());
app.use("/tickets", ticketsRouter);

describe("Tickets API", () => {
  let ticketId;

  it("should create a new ticket", async () => {
    const response = await request(app).post("/tickets").send({
      title: "Fix UI bug",
      description: "The login button is misaligned",
      deadline: "2023-12-31T23:59:59.000Z",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.title).toBe("Fix UI bug");
    expect(response.body.teamMember).toBe("Alice"); // Based on keywords
    ticketId = response.body.id;
  });

  it("should get all tickets", async () => {
    const response = await request(app).get("/tickets");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("id");
  });

  it("should update the status of a ticket", async () => {
    const response = await request(app)
      .patch(`/tickets/${ticketId}/status`)
      .send({ status: "In Progress" });

    expect(response.status).toBe(200);
    expect(response.body.ticket.status).toBe("In Progress");
  });

  it("should assign a ticket to a specific team member", async () => {
    const response = await request(app)
      .patch(`/tickets/${ticketId}/assign`)
      .send({ teamMember: "Bob" });

    expect(response.status).toBe(200);
    expect(response.body.ticket.teamMember).toBe("Bob");
  });

  it("should delete a ticket by ID", async () => {
    const response = await request(app).delete(`/tickets/${ticketId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Ticket deleted successfully");
  });

  it("should return 404 for a non-existent ticket", async () => {
    const response = await request(app).get("/tickets/999");

    expect(response.status).toBe(404);
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost:3000"}
 */

describe("App Component", () => {
  test("renders the form and ticket list", () => {
    render(<App />);
    expect(screen.getByText("Client Request Submission")).toBeInTheDocument();
    expect(screen.getByText("Ticket List")).toBeInTheDocument();
  });

  test("creates a new ticket", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Title:"), {
      target: { value: "Test Ticket" },
    });
    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "This is a test ticket" },
    });
    fireEvent.change(screen.getByLabelText("Deadline:"), {
      target: { value: "2023-12-31" },
    });
    fireEvent.change(screen.getByLabelText("Assign to Team Member:"), {
      target: { value: "Alice" },
    });

    fireEvent.click(screen.getByText("Submit Request"));

    await screen.findByText("Test Ticket");
  });

  test("deletes a ticket", async () => {
    render(<App />);

    // Simulate creating a ticket
    fireEvent.change(screen.getByLabelText("Title:"), {
      target: { value: "Ticket to Delete" },
    });
    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "This ticket will be deleted" },
    });
    fireEvent.change(screen.getByLabelText("Deadline:"), {
      target: { value: "2023-12-31" },
    });
    fireEvent.click(screen.getByText("Submit Request"));

    await screen.findByText("Ticket to Delete");

    // Simulate deleting the ticket
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(screen.queryByText("Ticket to Delete")).not.toBeInTheDocument()
    );
  });

  test("updates ticket status", async () => {
    render(<App />);

    // Simulate creating a ticket
    fireEvent.change(screen.getByLabelText("Title:"), {
      target: { value: "Ticket to Update" },
    });
    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "This ticket's status will be updated" },
    });
    fireEvent.change(screen.getByLabelText("Deadline:"), {
      target: { value: "2023-12-31" },
    });
    fireEvent.click(screen.getByText("Submit Request"));

    await screen.findByText("Ticket to Update");

    // Simulate updating the status
    fireEvent.change(screen.getByDisplayValue("Change status to"), {
      target: { value: "Done" },
    });

    await screen.findByText("Status: Done");
  });
});

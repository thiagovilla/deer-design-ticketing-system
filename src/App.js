import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const ONE_DAY_IN_MS = 86400000; // Milliseconds in one day

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: new Date(Date.now() + ONE_DAY_IN_MS).toISOString().split("T")[0], // Default to a day from now
    teamMember: "",
  });

  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null); // State to store errors
  const [loading, setLoading] = useState(false); // State to track loading status

  const teamMembers = [
    { id: 1, name: "Alice", skills: "Frontend" },
    { id: 2, name: "Bob", skills: "Backend" },
    { id: 3, name: "Charlie", skills: "DevOps" },
    { id: 4, name: "Diana", skills: "UI/UX" },
    { id: 5, name: "Eve", skills: "QA" },
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Blocked", label: "Blocked" },
    { value: "Done", label: "Done" },
  ];

  useEffect(() => {
    // Fetch tickets from the API on component mount
    fetch(`${process.env.REACT_APP_API_URL}/tickets`)
      .then((response) => response.json())
      .then((data) => setTickets(data))
      .catch((error) => setError("Error fetching tickets: " + error.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true
    const newTicket = {
      ...formData,
      deadline: new Date(formData.deadline).toISOString(), // Convert to ISO format
      status: "Pending",
    };

    // Send the new ticket to the API
    fetch(`${process.env.REACT_APP_API_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTicket),
    })
      .then((response) => response.json())
      .then((createdTicket) => {
        setTickets([...tickets, createdTicket]);
        setFormData({
          title: "",
          description: "",
          deadline: new Date(Date.now() + ONE_DAY_IN_MS)
            .toISOString()
            .split("T")[0], // Reset to a day from now
          teamMember: "",
        });
        setError(null); // Clear any previous errors
      })
      .catch((error) => setError("Error creating ticket: " + error.message))
      .finally(() => setLoading(false)); // Set loading to false
  };

  const handleDelete = (ticketId) => {
    // Send delete request to the API
    fetch(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
        } else {
          throw new Error("Failed to delete the ticket");
        }
      })
      .catch((error) => setError("Error deleting ticket: " + error.message));
  };

  const handleStatusChange = (ticketId, newStatus) => {
    // Send update request to the API
    fetch(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (response.ok) {
          setTickets(
            tickets.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
            )
          );
        } else {
          throw new Error("Failed to update the ticket status");
        }
      })
      .catch((error) =>
        setError("Error updating ticket status: " + error.message)
      );
  };

  const handleAssign = (ticketId, teamMember) => {
    fetch(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamMember }),
    })
      .then((response) => {
        if (response.ok) {
          setTickets(
            tickets.map((t) => (t.id === ticketId ? { ...t, teamMember } : t))
          );
        } else {
          throw new Error("Failed to assign the ticket");
        }
      })
      .catch((error) => setError("Error assigning ticket: " + error.message));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "done":
        return "green";
      case "blocked":
        return "red";
      case "pending":
        return "#d4aa00"; // Darker shade of yellow
      default:
        return "black";
    }
  };

  return (
    <div className="App">
      <h1>Client Request Submission</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}{" "}
      {/* Display errors */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Deadline:</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Assign to Team Member:</label>
          <select
            name="teamMember"
            value={formData.teamMember}
            onChange={handleChange}
          >
            <option value="">Select a member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name} ({member.skills})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="spinner"
              style={{
                animation: "spin 1s linear infinite",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                strokeDasharray="283"
                strokeDashoffset="75"
              ></circle>
            </svg>
          ) : (
            "Submit Request"
          )}
        </button>
      </form>
      <h2>Ticket List</h2>
      {tickets.length === 0 ? (
        <p>No tickets yet</p>
      ) : (
        <ul>
          {tickets.map((ticket, index) => (
            <li key={index}>
              <strong>{ticket.title}</strong> - {ticket.description} (Deadline:{" "}
              {new Date(ticket.deadline).toISOString().split("T")[0]}) <br />
              Assigned to:{" "}
              {ticket.teamMember ? (
                ticket.teamMember
              ) : (
                <>
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    Unassigned
                  </span>{" "}
                  -{" "}
                  <select
                    value=""
                    onChange={(e) => handleAssign(ticket.id, e.target.value)}
                    style={{
                      border: "1px solid #ccc",
                      background: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      alignItems: "center",
                      color: "black",
                      width: "auto",
                    }}
                  >
                    <option value="" disabled>
                      Assign to
                    </option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name} ({member.skills})
                      </option>
                    ))}
                  </select>
                </>
              )}{" "}
              |{" "}
              <span style={{ color: getStatusColor(ticket.status) }}>
                Status: {ticket.status}
              </span>{" "}
              |{" "}
              <select
                value=""
                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                style={{
                  border: "1px solid #ccc",
                  background: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  alignItems: "center",
                  color: "black",
                  marginRight: "8px",
                  width: "auto",
                }}
              >
                <option value="" disabled>
                  Change status to
                </option>
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={ticket.status === option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDelete(ticket.id)}
                style={{
                  border: "1px solid #ccc",
                  background: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "black",
                  verticalAlign: "middle",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "16px", height: "16px" }}
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-2 14H7L5 6"></path>
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Add CSS for spinner animation
const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default App;

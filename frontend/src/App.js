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

  const teamMembers = [
    { id: 1, name: "Alice", skills: "Frontend" },
    { id: 2, name: "Bob", skills: "Backend" },
    { id: 3, name: "Charlie", skills: "DevOps" },
    { id: 4, name: "Diana", skills: "UI/UX" },
    { id: 5, name: "Eve", skills: "QA" },
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
      .catch((error) => setError("Error creating ticket: " + error.message));
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
            required
          >
            <option value="">Select a member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name} ({member.skills})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Submit Request</button>
      </form>
      <h2>Ticket List</h2>
      <ul>
        {tickets.map((ticket, index) => (
          <li key={index}>
            <strong>{ticket.title}</strong> - {ticket.description} (Deadline:{" "}
            {new Date(ticket.deadline).toISOString().split("T")[0]}) <br />
            Assigned to: {ticket.teamMember} |{" "}
            <span style={{ color: getStatusColor(ticket.status) }}>
              Status: {ticket.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

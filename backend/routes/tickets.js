var express = require("express");
var router = express.Router();

let tickets = []; // In-memory ticket storage
let ticketIdCounter = 1;

// Create a new ticket
router.post("/", function (req, res) {
  const { title, deadline, description, teamMember } = req.body;
  if (!title || !teamMember) {
    return res
      .status(400)
      .json({ error: "Missing required fields: title and/or teamMember" });
  }

  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
  const newTicket = {
    id: ticketIdCounter++,
    title,
    deadline: deadline || new Date(Date.now() + ONE_DAY_IN_MS).toISOString(), // Default to a day from now
    description: description || null,
    teamMember,
    status: "Pending",
  };
  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Get all tickets
router.get("/", function (req, res) {
  res.json(tickets);
});

module.exports = router;

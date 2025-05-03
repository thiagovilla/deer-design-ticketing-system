var express = require("express");
var router = express.Router();

let tickets = []; // In-memory ticket storage
let ticketIdCounter = 1;

// Mapping of skills to keywords and responsible team members
const skillToKeywords = {
  frontend: { keywords: ["UI", "frontend", "React", "CSS"], member: "Alice" },
  backend: { keywords: ["API", "backend", "Node", "database"], member: "Bob" },
  devops: {
    keywords: ["DevOps", "CI/CD", "infrastructure", "cloud"],
    member: "Charlie",
  },
  uiux: { keywords: ["design", "UX", "prototype", "Figma"], member: "Diana" },
  qa: { keywords: ["test", "QA", "bug", "automation"], member: "Eve" },
};

// Function to determine the team member based on title and description
function assignTeamMember(title, description) {
  const content = `${title} ${description || ""}`.toLowerCase();
  let bestMatch = { member: null, score: 0 };

  for (const skill in skillToKeywords) {
    const { keywords, member } = skillToKeywords[skill];
    const score = keywords.reduce((count, keyword) => {
      return count + (content.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    if (score > bestMatch.score) {
      bestMatch = { member, score };
    }
  }

  return bestMatch.member || null; // Default to "Unassigned" (null) if no match
}

// Create a new ticket
router.post("/", function (req, res) {
  const { title, deadline, description, teamMember } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Missing required field: title" });
  }

  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
  const assignedTeamMember = teamMember || assignTeamMember(title, description);

  const newTicket = {
    id: ticketIdCounter++,
    title,
    deadline: deadline || new Date(Date.now() + ONE_DAY_IN_MS).toISOString(), // Default to a day from now
    description: description || null,
    teamMember: assignedTeamMember,
    status: "Pending",
  };

  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Get all tickets
router.get("/", function (req, res) {
  res.json(tickets);
});

// Delete a ticket by ID
router.delete("/:id", function (req, res) {
  const ticketId = parseInt(req.params.id, 10);
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === ticketId);

  if (ticketIndex === -1) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  tickets.splice(ticketIndex, 1);
  res.status(200).json({ message: "Ticket deleted successfully" });
});

// Update the status of a ticket by ID
router.patch("/:id/status", function (req, res) {
  const ticketId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Missing required field: status" });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  ticket.status = status;
  res
    .status(200)
    .json({ message: "Ticket status updated successfully", ticket });
});

// Assign a task to a specific team member by ID
router.patch("/:id/assign", function (req, res) {
  const ticketId = parseInt(req.params.id, 10);
  const { teamMember } = req.body;

  if (!teamMember) {
    return res
      .status(400)
      .json({ error: "Missing required field: teamMember" });
  }

  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  ticket.teamMember = teamMember;
  res.status(200).json({ message: "Ticket assigned successfully", ticket });
});

module.exports = router;

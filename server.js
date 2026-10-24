
// Import Express.js to create our server.
const express = require("express");

// Import the File System promises module.
const fs = require("fs").promises;

// Import path to build a reliable file path.
const path = require("path");

// Import reusable validation functions.
const {
    isValidId,
    isValidText,
    isValidDate,
    isValidAmount
} = require("./utils/validation");

// Create the Express application.
const app = express();

// Define the server port.
const PORT = 3000;

// Get the path to our existing JSON data file.
const expenseFile = path.join(
    __dirname,
    "data",
    "expense.json"
);

// Allow the server to receive JSON data.
app.use(express.json());
// Serve frontend files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Create our first API route.
// GET means we want to retrieve data.
app.get("/api/expenses", async (req, res) => {
    try {
        // Read expenses from our existing JSON file.
        const data = await fs.readFile(
            expenseFile,
            "utf8"
        );

        // Convert JSON text into a JavaScript array.
        const expenses = JSON.parse(data);

        // Send the expenses to whoever requested them.
        res.json(expenses);

    } catch (error) {
        // Return an error if reading the file fails.
        console.error(error);

        res.status(500).json({
            message: "Failed to read expenses."
        });
    }
});


// POST route for adding a new expense.
app.post("/api/expenses", async (req, res) => {
    try {
        // Receive expense details from the request body.
        const { title, date, id, category, amount } = req.body;

        // Check that all required fields are provided.
        if (
            title === undefined ||
            date === undefined ||
            id === undefined ||
            category === undefined ||
            amount === undefined
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Convert inputs to trimmed strings for validation.
        const cleanTitle = String(title).trim();
        const cleanDate = String(date).trim();
        const cleanId = String(id).trim();
        const cleanCategory = String(category).trim();
        const cleanAmount = String(amount).trim();

        // Reject empty fields.
        if (
            !cleanTitle ||
            !cleanDate ||
            !cleanId ||
            !cleanCategory ||
            !cleanAmount
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Validate title and category.
        if (
            !isValidText(cleanTitle) ||
            !isValidText(cleanCategory)
        ) {
            return res.status(400).json({
                message: "Invalid title or category."
            });
        }

        // Validate the expense ID.
        if (!isValidId(cleanId)) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        // Validate the date.
        if (!isValidDate(cleanDate)) {
            return res.status(400).json({
                message: "Please provide a valid date (YYYY-MM-DD)."
            });
        }

        // Validate the amount.
        if (!isValidAmount(cleanAmount)) {
            return res.status(400).json({
                message: "Amount must be greater than zero."
            });
        }

        // Convert validated values into numbers.
        const numericId = Number(cleanId);
        const numericAmount = Number(cleanAmount);

        // Read the existing expenses.
        const data = await fs.readFile(expenseFile, "utf8");
        const expenses = JSON.parse(data);

        // Prevent duplicate IDs, including string/number differences.
        const duplicate = expenses.some(
            (expense) => Number(expense.id) === numericId
        );

        if (duplicate) {
            return res.status(409).json({
                message: "Expense ID already exists."
            });
        }

        // Create the new expense object.
        const newExpense = {
            title: cleanTitle,
            date: cleanDate,
            id: numericId,
            category: cleanCategory,
            amount: numericAmount
        };

        // Add the new expense to the array.
        expenses.push(newExpense);

        // Save the updated array to the JSON file.
        await fs.writeFile(
            expenseFile,
            JSON.stringify(expenses, null, 2)
        );

        // Return a success response.
        res.status(201).json({
            message: "Expense added successfully.",
            expense: newExpense
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add expense."
        });
    }
});


// ------------------------------------------------
// PUT API: UPDATE AN EXISTING EXPENSE
// ------------------------------------------------

// This route updates an expense using its ID.
// Example: PUT /api/expenses/30
app.put("/api/expenses/:id", async (req, res) => {

    try {
        // Get the ID from the URL.
        // req.params.id is initially a string.
        const cleanId = req.params.id;

        // Check whether the ID is a positive whole number.
        if (!isValidId(cleanId)) {
            return res.status(400).json({
                message: "Invalid expense ID."
            });
        }

        // Convert the ID into a number.
        const numericId = Number(cleanId);

        // Receive the new details from the request body.
        const { title, date, category, amount } = req.body;

        // Check that all required fields are provided.
        if (
            title === undefined ||
            date === undefined ||
            category === undefined ||
            amount === undefined
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Convert inputs to strings and remove extra spaces.
        const cleanTitle = String(title).trim();
        const cleanDate = String(date).trim();
        const cleanCategory = String(category).trim();
        const cleanAmount = String(amount).trim();

        // Check for empty fields.
        if (
            !cleanTitle ||
            !cleanDate ||
            !cleanCategory ||
            !cleanAmount
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Validate the title and category.
        if (
            !isValidText(cleanTitle) ||
            !isValidText(cleanCategory)
        ) {
            return res.status(400).json({
                message: "Invalid title or category."
            });
        }

        // Validate the date.
        if (!isValidDate(cleanDate)) {
            return res.status(400).json({
                message: "Please provide a valid date (YYYY-MM-DD)."
            });
        }

        // Validate the amount.
        if (!isValidAmount(cleanAmount)) {
            return res.status(400).json({
                message: "Amount must be greater than zero."
            });
        }

        // Convert the validated amount into a number.
        const numericAmount = Number(cleanAmount);

        // Read the existing expenses from the JSON file.
        const data = await fs.readFile(expenseFile, "utf8");
        const expenses = JSON.parse(data);

        // Find the expense we want to update.
        const expense = expenses.find(
            (item) => Number(item.id) === numericId
        );

        // Stop if the expense does not exist.
        if (!expense) {
            return res.status(404).json({
                message: "Expense not found."
            });
        }

        // Update the existing expense's details.
        expense.title = cleanTitle;
        expense.date = cleanDate;
        expense.category = cleanCategory;
        expense.amount = numericAmount;

        // Save the updated expenses to the JSON file.
        await fs.writeFile(
            expenseFile,
            JSON.stringify(expenses, null, 2)
        );

        // Send a success response to the client.
        return res.status(200).json({
            message: "Expense updated successfully.",
            expense: expense
        });

    } catch (error) {
        // Display the error in the server terminal.
        console.error(error);

        // Send an error response to the client.
        return res.status(500).json({
            message: "Failed to update expense."
        });
    }
});


// ------------------------------------------------
// DELETE API: REMOVE AN EXPENSE
// ------------------------------------------------

// This route deletes an expense using its ID.
// Example: DELETE /api/expenses/30
app.delete("/api/expenses/:id", async (req, res) => {

    try {
        // Read the ID from the URL.
        const cleanId = req.params.id;

        // Check whether the ID is valid.
        if (!isValidId(cleanId)) {
            return res.status(400).json({
                message: "Invalid expense ID."
            });
        }

        // Convert the ID into a number.
        const numericId = Number(cleanId);

        // Read all expenses from the JSON file.
        const data = await fs.readFile(expenseFile, "utf8");
        const expenses = JSON.parse(data);

        // Find the expense that should be deleted.
        const expense = expenses.find(
            (item) => Number(item.id) === numericId
        );

        // Return an error if the expense does not exist.
        if (!expense) {
            return res.status(404).json({
                message: "Expense not found."
            });
        }

        // Create a new array without the selected expense.
        const remainingExpenses = expenses.filter(
            (item) => Number(item.id) !== numericId
        );

        // Save the remaining expenses to the JSON file.
        await fs.writeFile(
            expenseFile,
            JSON.stringify(remainingExpenses, null, 2)
        );

        // Confirm that deletion was successful.
        return res.status(200).json({
            message: "Expense deleted successfully.",
            expense: expense
        });

    } catch (error) {
        // Display the error in the server terminal.
        console.error(error);

        // Send an error response to the client.
        return res.status(500).json({
            message: "Failed to delete expense."
        });
    }
});


// Start the server and listen for requests.
app.listen(PORT, () => {
    console.log(
        `Expense Tracker API running at http://localhost:${PORT}`
    );
});

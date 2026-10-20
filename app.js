// Import the readline module.
// It allows us to receive input from the terminal.
const readline = require("readline");

// Import the promises version of the File System module.
// We use it to read and write our expense.json file.
const fs = require("fs").promises;
// Import reusable validation functions.
const {
    isValidId,
    isValidText,
    isValidDate,
    isValidAmount
} = require("./utils/validation");


// Create the readline interface.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


// This function asks a question in the terminal
// and returns the user's answer as a Promise.
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}


// ------------------------------------------------
// REUSABLE FILE FUNCTIONS
// ------------------------------------------------

// This function reads the expense.json file
// and converts the JSON data into a JavaScript array.
async function readExpenses() {

    // Read the expense.json file.
    const data = await fs.readFile(
        "./data/expense.json",
        "utf8"
    );

    // Convert the JSON text into a JavaScript array
    // and return it to the function that called it.
    return JSON.parse(data);
}


// This function saves the expenses array
// back into the expense.json file.
async function saveExpenses(expenses) {

    // Convert the JavaScript array into JSON text
    // and save it inside expense.json.
    await fs.writeFile(
        "./data/expense.json",
        JSON.stringify(expenses, null, 2)
    );
} 




// Display the main menu to the user.
function showMenu() {

    console.log("\n=============================");
    console.log("       EXPENSE TRACKER");
    console.log("=============================");

    console.log("1. Add Expense");
    console.log("2. View Expenses");
    console.log("3. Delete Expense");
    console.log("4. Update Expense");
    console.log("5. Search Expense");
console.log("6. Total Expenses");
console.log("7. Filter Expenses by Category");
console.log("8. Filter Expenses by Date");
console.log("9. Exit");
}


// Display and handle the main menu.
async function showMainMenu() {

    // Store the user's choice.
    let choice = "";

    // Keep showing the menu until the user chooses 9.
    while (choice !== "9") {

        // Display the menu.
        showMenu();

        // Ask the user to choose an option.
        choice = await askQuestion("Choose an option: ");


        // Check which option the user selected.
        if (choice === "1") {

            await addExpense();

        } else if (choice === "2") {

            await viewExpenses();

        } else if (choice === "3") {

            await deleteExpense();

        } else if (choice === "4") {

            await updateExpense();

        } else if (choice === "5") {

            await searchExpense();

        } else if (choice === "6") {
       

            await totalExpenses();
             } else if (choice === "7") {
                await filterExpensesByCategory();

        } else if (choice === "8") {

            await filterExpensesByDate();

        } else if (choice === "9") {

            console.log("Goodbye!");

            break;

        } else {

            console.log(
                "Invalid option. Please choose 1 to 9."
            );
        }
    }

    // Close readline after the program finishes.
    rl.close();
}
   


// Main function where our Expense Tracker logic runs.
async function addExpense() {

    // Ask the user for expense information.
    const title = await askQuestion("Enter your expense title: ");

    const date = await askQuestion(
        "Enter the date of the expense (YYYY-MM-DD): "
    );

    const id = await askQuestion("Enter the expense ID: ");

    const category = await askQuestion(
        "Enter the category of the expense: "
    );

    const amount = await askQuestion(
        "Enter the expense amount: "
    );


    // Remove unnecessary spaces from the beginning
    // and end of every input.
    const cleanTitle = title.trim();
    const cleanDate = date.trim();
    const cleanId = id.trim();
    const cleanCategory = category.trim();
    const cleanAmount = amount.trim();

    // Convert the ID from a string into a number.
const numericId = Number(cleanId);


    // ------------------------------------------------
    // 1. CHECK EMPTY FIELDS
    // ------------------------------------------------

    if (
        cleanTitle === "" ||
        cleanDate === "" ||
        cleanId === "" ||
        cleanCategory === "" ||
        cleanAmount === ""
    ) {

        console.log("All fields are required.");

     

        return;
    }

    // Check whether the title is valid and contains at least one letter.
    if (!isValidText(cleanTitle)) {
        console.log("Invalid title. Please enter a valid expense title.");
    
    return;
}

// Check whether the category is valid.
if (!isValidText(cleanCategory)) {

    // Tell the user that the category is invalid.
    console.log(
        "Invalid category. Please enter a valid category."
    );

    // Stop the function.
    return;
}


    // Check whether the ID is a whole number
// and greater than zero.
if (!isValidId(cleanId)) {

    // Tell the user that the ID is invalid.
    console.log("Invalid ID. Please enter a positive whole number.");

   
   

    // Stop the main function.
    return;
}


    // ------------------------------------------------
  // Check whether the date is valid.
if (!isValidDate(cleanDate)) {

    // Display an error if the date is invalid.
    console.log(
        "Invalid date. Please enter a valid date in YYYY-MM-DD format."
    );

    // Stop adding the expense.
    return;
}


    // ------------------------------------------------
// 4. READ THE JSON FILE
// ------------------------------------------------

try {

    // Read all expenses from expense.json.
    const expenses = await readExpenses();





        // ------------------------------------------------
        // 5. VALIDATE AMOUNT
        // ------------------------------------------------

        // Convert amount from string to number.
      // Check whether the amount is valid.
if (!isValidAmount(cleanAmount)) {

    console.log(
        "Invalid amount. Please enter a number greater than 0."
    );

    return;
}

// Convert the valid amount into a number.
const numericAmount = Number(cleanAmount);
        


        // ------------------------------------------------
        // 6. CREATE NEW EXPENSE OBJECT
        // ------------------------------------------------

        const expense = {

            // Expense title.
            title: cleanTitle,

            // Expense date.
            date: cleanDate,

            // Expense ID.
            id: numericId,

            // Expense category.
            category: cleanCategory,

            // Expense amount as a number.
            amount: numericAmount
        };


        // ------------------------------------------------
        // 7. CHECK DUPLICATE ID
        // ------------------------------------------------

        const existingExpense = expenses.find(
            (item) => item.id === numericId
        );


        if (existingExpense) {

            console.log("Expense ID already exists.");

          

            return;
        }


        // ------------------------------------------------
        // 8. ADD EXPENSE TO ARRAY
        // ------------------------------------------------

        expenses.push(expense);


        // ------------------------------------------------
        // 9. SAVE ARRAY BACK TO JSON FILE
        // ------------------------------------------------

      // Save the updated expenses to expense.json.
await saveExpenses(expenses);


        // Tell the user that saving was successful.
        console.log("Expense saved successfully.");


    } catch (err) {

        // Display an error if something goes wrong.
        console.error(err);
    }


   
   
}


// Function for deleting an expense.
async function deleteExpense() {

    // Ask the user for the ID of the expense to delete.
    const id = await askQuestion(
        "Enter the expense ID to delete: "
    );

    // Remove unnecessary spaces.
    const cleanId = id.trim();

    // Convert the ID from a string into a number.
 // Check whether the ID is valid.
if (!isValidId(cleanId)) {

    console.log(
        "Invalid ID. Please enter a positive whole number."
    );

    return;
}

// Convert the valid ID into a number.
const numericId = Number(cleanId);


    try {

       // Read all expenses from expense.json.
const expenses = await readExpenses();

                // Find the expense with the selected ID.
        const expense = expenses.find(
            (item) => item.id === numericId
        );
                if (!expense) {

            console.log(
                "Expense with that ID was not found."
            );

            return;
        }


        




        // Create a new array without the expense
        // that has the selected ID.
        const remainingExpenses = expenses.filter(
            (expense) => expense.id !== numericId
        );

// Save the remaining expenses to expense.json.
await saveExpenses(remainingExpenses);


        // Tell the user that deletion was successful.
        console.log("Expense deleted successfully.");


    } catch (err) {

        // Display any error that occurs.
        console.error(err);
    }
}


// Function for updating an existing expense.
async function updateExpense() {

    // Ask the user for the ID of the expense to update.
    const id = await askQuestion(
        "Enter the expense ID to update: "
    );

    // Remove unnecessary spaces.
    const cleanId = id.trim();

    // Convert the ID from a string into a number.
    const numericId = Number(cleanId);

    // Check whether the ID is a valid positive whole number.
    if (!isValidId(cleanId)) {

        console.log(
            "Invalid ID. Please enter a positive whole number."
        );

        return;
    }

    try {

       // Read all expenses from expense.json.
const expenses = await readExpenses();


        // Find the expense with the selected ID.
        const expense = expenses.find(
            (item) => item.id === numericId
        );
        


        // Check whether the expense exists.
        if (!expense) {

            console.log(
                "Expense with that ID was not found."
            );

            return;
        }


        // Ask the user for the new expense title.
        const title = await askQuestion(
            "Enter new expense title: "
        );


        // Ask the user for the new date.
        const date = await askQuestion(
            "Enter new date (YYYY-MM-DD): "
        );


        // Ask the user for the new category.
        const category = await askQuestion(
            "Enter new category: "
        );


        // Ask the user for the new amount.
        const amount = await askQuestion(
            "Enter new amount: "
        );


        // Remove unnecessary spaces.
        const cleanTitle = title.trim();
        const cleanDate = date.trim();
        const cleanCategory = category.trim();
        const cleanAmount = amount.trim();


        // Check whether any field is empty.
        if (
            cleanTitle === "" ||
            cleanDate === "" ||
            cleanCategory === "" ||
            cleanAmount === ""
        ) {

            console.log("All fields are required.");

            return;
        }


        // Check whether the title is valid.
if (!isValidText(cleanTitle)) {

    // Tell the user that the title is invalid.
    console.log(
        "Invalid title. Please enter a valid expense title."
    );

    // Stop the update function.
    return;
}


// Check whether the category is valid.
if (!isValidText(cleanCategory)) {

    console.log(
        "Invalid category. Please enter a valid category."
    );

    return;
}

      // Check whether the new date is valid.
if (!isValidDate(cleanDate)) {

    // Display an error if the date is invalid.
    console.log(
        "Invalid date. Please enter a valid date in YYYY-MM-DD format."
    );

    // Stop updating the expense.
    return;
}


        // Convert the new amount into a number.
      
if (!isValidAmount(cleanAmount)) {
    console.log("Invalid amount. Please enter a number greater than 0.");
    return;
}

const numericAmount = Number(cleanAmount);



        // Update the existing expense.
        expense.title = cleanTitle;
        expense.date = cleanDate;
        expense.category = cleanCategory;
        expense.amount = numericAmount;


        // Save the updated expenses back to the JSON file.
        await saveExpenses(expenses);


        // Tell the user that the update was successful.
        console.log("Expense updated successfully.");


    } catch (err) {

        // Display any error that occurs.
        console.error(err);
    }
}


// Function for searching an expense by ID.
async function searchExpense() {

    // Ask the user for the expense ID to search.
    const id = await askQuestion(
        "Enter the expense ID to search: "
    );


    // Remove unnecessary spaces.
    const cleanId = id.trim();


  


  // Check whether the ID is valid.
if (!isValidId(cleanId)) {

    console.log(
        "Invalid ID. Please enter a positive whole number."
    );

    return;
}

// Convert the valid ID into a number.
const numericId = Number(cleanId);


    try {

       // Read all expenses from expense.json.
const expenses = await readExpenses();


        // Search for the expense using its ID.
        const expense = expenses.find(
            (item) => item.id === numericId
        );


        // Check whether the expense was found.
        if (!expense) {

            console.log(
                "Expense with that ID was not found."
            );

            return;
        }


        // Display the found expense.
        console.log("\n=============================");
        console.log("        EXPENSE FOUND");
        console.log("=============================");

        console.log(`Title: ${expense.title}`);
        console.log(`Date: ${expense.date}`);
        console.log(`ID: ${expense.id}`);
        console.log(`Category: ${expense.category}`);
        console.log(
            `Amount: Tsh ${expense.amount.toLocaleString()}`
        );

        console.log("=============================");


    } catch (err) {

        // Display any error that occurs.
        console.error(err);
    }
}
// Function for calculating the total of all expenses.
async function totalExpenses() {

    try {

        // Read the expense.json file.
      // Read all expenses from expense.json.
const expenses = await readExpenses();


        // Check whether there are no saved expenses.
        if (expenses.length === 0) {

            console.log("No expenses found.");

            return;
        }


        // Calculate the total amount of all expenses.
        const total = expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


        // Display the total.
        console.log("\n=============================");
        console.log("       TOTAL EXPENSES");
        console.log("=============================");

        console.log(
            `Total: Tsh ${total.toLocaleString()}`
        );

        console.log("=============================");


    } catch (err) {

        // Display any error that occurs.
        console.error(err);
    }
}

// Function for filtering expenses by category.
async function filterExpensesByCategory() {

    // Ask the user for the category to search.
    const category = await askQuestion(
        "Enter the category to filter: "
    );


    // Remove unnecessary spaces.
    const cleanCategory = category.trim();


    // Check whether the category is empty.
    if (cleanCategory === "") {

        console.log("Category is required.");

        return;
    }


    // Check whether the category contains at least one letter.
  if (!isValidText(cleanCategory)) {
    console.log(
        "Invalid category. Please enter a valid category."
    );

    return;
}


    try {


    // Read all expenses from expense.json.
    const expenses = await readExpenses();


        // Filter expenses by category.
        //
        // toLowerCase() allows:
        // Food
        // food
        // FOOD
        // to be treated as the same category.
        const filteredExpenses = expenses.filter(
            (expense) =>
                expense.category.toLowerCase() ===
                cleanCategory.toLowerCase()
        );


        // Check whether any expense was found.
        if (filteredExpenses.length === 0) {

            console.log(
                `No expenses found in category "${cleanCategory}".`
            );

            return;
        }


        // Display the filtered expenses.
        console.log("\n=============================");
        console.log(
            `      ${cleanCategory.toUpperCase()} EXPENSES`
        );
        console.log("=============================");

// Go through each matching expense.
for (const expense of filteredExpenses) {

    console.log(`Title: ${expense.title}`);
    console.log(`Date: ${expense.date}`);
    console.log(`ID: ${expense.id}`);
    console.log(`Category: ${expense.category}`);
    console.log(
        `Amount: Tsh ${expense.amount.toLocaleString()}`
    );

    console.log("-----------------------------");
}

// Calculate the total amount for this category.
const categoryTotal = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
);

// Display the category total.
console.log(
    `Total ${cleanCategory}: Tsh ${categoryTotal.toLocaleString()}`
);

console.log("=============================");
        


    } catch (err) {

        // Display any error that occurs.
        console.error(err);
    }
}



// Function for displaying all saved expenses.
async function viewExpenses() {
    try {
       // Read all expenses from expense.json.
const expenses = await readExpenses();

        if (expenses.length === 0) {
            console.log("No expenses found.");
            return;
        }

        console.log("\n=============================");
        console.log("        ALL EXPENSES");
        console.log("=============================");

        for (const expense of expenses) {
            console.log(`Title: ${expense.title}`);
            console.log(`Date: ${expense.date}`);
            console.log(`ID: ${expense.id}`);
            console.log(`Category: ${expense.category}`);
            console.log(
                `Amount: Tsh ${expense.amount.toLocaleString()}`
            );
            console.log("-----------------------------");
        }

        console.log("=============================");

    } catch (err) {
        console.error(err);
    }
}

// Function for filtering expenses by date.
async function filterExpensesByDate() {

    // Ask the user for the date.
    const date = await askQuestion(
        "Enter the date to filter (YYYY-MM-DD): "
    );

    // Remove unnecessary spaces.
    const cleanDate = date.trim();

    // Check if the date is empty.
    if (cleanDate === "") {

        console.log("Date is required.");

        return;
    }

// Check whether the selected date is valid.
if (!isValidDate(cleanDate)) {

    // Display an error if the date is invalid.
    console.log(
        "Invalid date. Please enter a valid date in YYYY-MM-DD format."
    );

    // Stop filtering expenses.
    return;
}

    try {

    // Read all expenses from expense.json.
    const expenses = await readExpenses();

        // Filter expenses by the selected date.
        const filteredExpenses = expenses.filter(
            (expense) => expense.date === cleanDate
        );

        // Check whether any expense was found.
        if (filteredExpenses.length === 0) {

            console.log(
                `No expenses found on ${cleanDate}.`
            );

            return;
        }

        // Display heading.
        console.log("\n=============================");
        console.log(`   EXPENSES ON ${cleanDate}`);
        console.log("=============================");

        // Display matching expenses.
        for (const expense of filteredExpenses) {

            console.log(`Title: ${expense.title}`);
            console.log(`Date: ${expense.date}`);
            console.log(`ID: ${expense.id}`);
            console.log(`Category: ${expense.category}`);
            console.log(
                `Amount: Tsh ${expense.amount.toLocaleString()}`
            );

            console.log("-----------------------------");
        }

        // Calculate the total expenses for this date.
        const dateTotal = filteredExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        // Display the total.
        console.log(
            `Total for ${cleanDate}: Tsh ${dateTotal.toLocaleString()}`
        );

        console.log("=============================");

    } catch (err) {

        // Display any error that occurs.
        console.error(err);
    }
}

// Start the program through the main menu.
showMainMenu();


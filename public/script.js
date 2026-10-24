
/*
    EXPENSE TRACKER - FRONTEND

    File: public/script.js

    Kazi zake:
    1. Kusoma expenses kutoka Express API.
    2. Kuonyesha expenses kwenye table.
    3. Kuhesabu jumla ya matumizi.
    4. Kuongeza expense mpya.
    5. Kufuta expense.
*/

// API endpoint yetu ya kusoma na kubadilisha expenses.
const API_URL = "/api/expenses";

// Kupata sehemu ya HTML inayoonyesha total ya matumizi.
const totalExpensesElement = document.getElementById("total-expenses");

// Kupata sehemu ya HTML inayoonyesha idadi ya expenses.
const expenseCountElement = document.getElementById("expense-count");

// Kupata sehemu ya HTML inayoonyesha expense ya mwisho.
const latestExpenseElement = document.getElementById("latest-expense");

// Kupata tbody ya table ambayo itaonyesha expenses.
const expensesTableBody = document.getElementById("expenses-table-body");

// Kupata form ya kuongeza expense.
const expenseForm = document.getElementById("expense-form");

// Kupata sehemu za kuonyesha ujumbe.
const formMessage = document.getElementById("form-message");
const tableMessage = document.getElementById("table-message");

// Kupata panel ya form na buttons zake.
const expenseFormPanel = document.getElementById("add-expense");
const showFormButton = document.getElementById("show-form-btn");
const cancelFormButton = document.getElementById("cancel-form-btn");
const refreshButton = document.getElementById("refresh-btn");

/*
    FUNCTION: loadExpenses()

    Inachukua data kutoka API yetu na kuonyesha
    expenses kwenye dashboard.
*/

async function loadExpenses() {
    // Onyesha ujumbe wakati tunasubiri data.
    tableMessage.textContent = "Loading expenses...";

    try {
        // Tuma GET request kwa Express API.
        const response = await fetch(API_URL);

        // Kama server imerudisha HTTP error, toa error.
        if (!response.ok) {
            throw new Error("Failed to load expenses.");
        }

        // Badilisha JSON response kuwa JavaScript data.
        const expenses = await response.json();

        // Hakikisha tumepokea array ya expenses.
        if (!Array.isArray(expenses)) {
            throw new Error("Unexpected data received from server.");
        }

        // Peleka expenses kwenye function ya kuonyesha table.
        displayExpenses(expenses);

        // Sasisha summary cards.
        updateSummary(expenses);

        // Futa ujumbe wa awali kama kila kitu kimefanikiwa.
        tableMessage.textContent = "";

    } catch (error) {
        // Onyesha ujumbe kama server haipatikani au request imeshindwa.
        tableMessage.textContent =
            "Could not load expenses. Check that the server is running.";

        // Onyesha error kwenye VS Code terminal ya server/browser console.
        console.error("Error loading expenses:", error);
    }
}

/*
    FUNCTION: displayExpenses()

    Inapokea array ya expenses na kuziingiza kwenye HTML table.
*/

function displayExpenses(expenses) {
    // Ondoa rows za zamani kabla ya kuweka data mpya.
    expensesTableBody.replaceChildren();

    // Kama hakuna expenses, onyesha ujumbe.
    if (expenses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No expenses recorded yet.";

        row.appendChild(cell);
        expensesTableBody.appendChild(row);

        return;
    }

    // Pitia kila expense kwenye array.
    expenses.forEach((expense) => {
        // Tengeneza row mpya.
        const row = document.createElement("tr");

        // Tengeneza cells za taarifa za expense.
        const idCell = document.createElement("td");
        const titleCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const actionCell = document.createElement("td");

        // Weka taarifa kwenye cells.
        idCell.textContent = expense.id;
        titleCell.textContent = expense.title;
        categoryCell.textContent = expense.category;
        dateCell.textContent = expense.date;

        // Format amount ili isomeke vizuri kwa Tsh.
        const amount = Number(expense.amount);

        amountCell.textContent = Number.isFinite(amount)
            ? `Tsh ${amount.toLocaleString("en-TZ")}`
            : "Invalid amount";

        // Tengeneza button ya kufuta expense.
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";

        // Button itaita function ya kufuta expense hiyo.
        deleteButton.addEventListener("click", () => {
            deleteExpense(expense.id);
        });

        // Weka button ndani ya action cell.
        actionCell.appendChild(deleteButton);

        // Weka cells zote ndani ya row.
        row.append(
            idCell,
            titleCell,
            categoryCell,
            dateCell,
            amountCell,
            actionCell
        );

        // Ongeza row kwenye table.
        expensesTableBody.appendChild(row);
    });
}

/*
    FUNCTION: updateSummary()

    Inasasisha:
    - Jumla ya kiasi kilichotumika.
    - Idadi ya expenses.
    - Expense ya mwisho kwenye list.
*/

function updateSummary(expenses) {
    // Jumlisha amount za expenses zote.
    const total = expenses.reduce((sum, expense) => {
        // Hakikisha amount inachukuliwa kama namba.
        const amount = Number(expense.amount);

        // Usijumlishe thamani isiyo namba.
        return sum + (
            Number.isFinite(amount) && amount > 0 ? amount : 0
        );
    }, 0);

    // Onyesha jumla kwenye summary card.
    totalExpensesElement.textContent =
        `Tsh ${total.toLocaleString("en-TZ")}`;

    // Onyesha idadi ya expenses.
    expenseCountElement.textContent = expenses.length;

    // Onyesha title ya expense ya mwisho kwenye array.
    latestExpenseElement.textContent =
        expenses.length > 0
            ? expenses[expenses.length - 1].title
            : "None";
}

/*
    EVENT: kuongeza expense mpya.

    Mtumiaji akibonyeza Save Expense,
    tunatuma data kwenda Express API kwa POST.
*/

expenseForm.addEventListener("submit", async (event) => {
    // Zuia browser ku-refresh page yenyewe.
    event.preventDefault();

    // Futa ujumbe wa zamani.
    formMessage.textContent = "";

    // Soma taarifa kutoka kwenye form.
    const newExpense = {
        title: document.getElementById("title").value.trim(),
        date: document.getElementById("expense-date").value,
        id: Number(document.getElementById("expense-id").value),
        category: document.getElementById("category").value.trim(),
        amount: Number(document.getElementById("amount").value)
    };

    try {
        // Tuma taarifa mpya kwa Express API.
        const response = await fetch(API_URL, {
            method: "POST",

            // Eleza kuwa tunatuma JSON.
            headers: {
                "Content-Type": "application/json"
            },

            // Badilisha object kuwa JSON string.
            body: JSON.stringify(newExpense)
        });

        // Soma majibu kutoka server.
        const result = await response.json();

        // Kama server imekataa data, onyesha ujumbe wake.
        if (!response.ok) {
            throw new Error(result.message || "Could not save expense.");
        }

        // Onyesha ujumbe wa mafanikio.
        formMessage.textContent = "Expense saved successfully!";

        // Safisha form baada ya kuhifadhi.
        expenseForm.reset();

        // Ficha form na upakie upya list.
        expenseFormPanel.classList.add("hidden");
        await loadExpenses();

    } catch (error) {
        // Onyesha kosa lililorudishwa na server.
        formMessage.textContent = error.message;
        console.error("Error saving expense:", error);
    }
});



showFormButton.addEventListener("click", () => {
    expenseFormPanel.classList.remove("hidden");

    //  form.
    expenseFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});



cancelFormButton.addEventListener("click", () => {
    expenseForm.reset();

    formMessage.textContent = "";

    expenseFormPanel.classList.add("hidden");
});

/*
    Refresh button inapakia tena expenses kutoka API.
*/

refreshButton.addEventListener("click", () => {
    loadExpenses();
});

/*
    FUNCTION: deleteExpense()

    Inatuma DELETE request kwa API ili kufuta expense.
*/

async function deleteExpense(id) {
    // Omba uthibitisho kabla ya kufuta.
    const confirmed = window.confirm(
        `Are you sure you want to delete expense ID ${id}?`
    );

    // Kama mtumiaji amechagua Cancel, simama.
    if (!confirmed) {
        return;
    }

    try {
        // Tuma DELETE request kwa ID husika.
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        // Soma response ya server.
        const result = await response.json();

        // Shughulikia kosa lolote kutoka API.
        if (!response.ok) {
            throw new Error(result.message || "Could not delete expense.");
        }

        // Pakia upya table na summary.
        await loadExpenses();

    } catch (error) {
        tableMessage.textContent = error.message;
        console.error("Error deleting expense:", error);
    }
}

/*
    Anza kupakia data mara tu JavaScript inapotekelezwa.
*/

loadExpenses();

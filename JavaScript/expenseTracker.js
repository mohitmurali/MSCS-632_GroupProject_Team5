//MSCS 632 - Advanced Programming Languages
// Group Project - Expense Tracker
// Group 5: Mohit Gokul Murali, Shilpa Mesineni
// Date: March 23, 2025

const fs = require('fs').promises;
const readline = require('readline');

// ExpenseTracker class to manage expenses in daily life
class ExpenseTracker {
    constructor(fileLocation) {
        this.fileLocation = fileLocation;
        this.expenses = [];
        // Predefined categories
        this.categories = ['Food', 'Groceries', 'Transportation', 'Entertainment', 'Bills', 'Utilities', 'Other'];
        // Create a readline interface for user input from the console
        this.readLineInt = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    // Load expenses initially from the JSON file into memory which is stored locally
    // JSON file is used to store the expenses in the local storage - JSON file is saved as expenses.json
    async loadExpenses() {
        try {
            const data = await fs.readFile(this.fileLocation, 'utf8');
            this.expenses = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.expenses = []; // File doesn't exist, start with an empty list
            } else {
                console.error('Error loading expenses:', error); // show error if any
            }
        }
    }

    // Save expenses to the JSON file in the local storage
    async saveExpenses() {
        try {
            await fs.writeFile(this.fileLocation, JSON.stringify(this.expenses, null, 2));
        } catch (error) {
            console.error('Error saving the expenses, try again:', error);
        }
    }

    // Function to add the expenses with predefined categories
    async addExpenses() {
        const date = await this.askInputQuestion('Enter the date (YYYY-MM-DD): ');
        const amount = parseFloat(await this.askInputQuestion('Enter an amount: '));

        // Display categories and prompt for selection
        console.log('Select a category:');
        this.categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat}`);
        });
        const categoryIndex = parseInt(await this.askInputQuestion('Enter category number: ')) - 1;
        const category = this.categories[categoryIndex];

        const description = await this.askInputQuestion('Enter the expense description: ');

        // Validate inputs
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/) || isNaN(amount) || !category) {
            console.log('Invalid input (date must be YYYY-MM-DD, amount must be a number, category must be valid). Expense was not added.');
            return;
        }
        const expense = { id: Date.now(), date, amount, category, description };

        // Add the expense to the list
        this.expenses.push(expense);
        await this.saveExpenses();

        // Confirmation message
        console.log('Expense was added successfully.');
    }

    // View all expenses in the list by ID, Date, Amount, Category and Description
    viewExpenses() {
        if (this.expenses.length === 0) {
            console.log('No expenses were found.');
        } else {
            console.log('Expenses:');
            this.expenses.forEach(exp => {
                console.log(`ID: ${exp.id}, Date: ${exp.date}, Amount: $${exp.amount.toFixed(2)}, Category: ${exp.category}, Description: ${exp.description}`);
            });
        }
    }

    // Filter expenses by date or category
    async filterExpenses() {
        const filterBy = await this.askInputQuestion('Filter using (date/category): ');
        let filtered = this.expenses;

        // Filter by date
        if (filterBy === 'date') 
        {
            const startDate = await this.askInputQuestion('Enter start date (YYYY-MM-DD) of the expense: ');
            filtered = this.expenses.filter(exp => exp.date === startDate);
        } 
        // Filter by category
        else if (filterBy === 'category') 
          {
            // Display categories and prompt for selection
            console.log('Select a category to filter by:');
            this.categories.forEach((cat, index) => {
                console.log(`${index + 1}. ${cat}`);
            });
            const categoryIndex = parseInt(await this.askInputQuestion('Enter category number: ')) - 1;
            const category = this.categories[categoryIndex];
            if (!category) {
                console.log('Invalid category selected.');
                return;
            }
            filtered = this.expenses.filter(exp => exp.category === category);
        } 
        // Invalid filter - return error
        else {
            console.log('Invalid filter selected. Please enter "date" or "category".');
            return;
        }
        
        // Display null message if no expenses found
        if (filtered.length === 0) {
            console.log('There are no expenses that match the filter.');
        } 
        
        // Else show the filtered expenses
        else {
            console.log('Filtered Expenses:');
            filtered.forEach(exp => {
                console.log(`ID: ${exp.id}, Date: ${exp.date}, Amount: $${exp.amount.toFixed(2)}, Category: ${exp.category}, Description: ${exp.description}`);
            });
        }
    }

    // View summary of expenses by category and total
    viewSummaryByCategoryAndTotal() {
        if (this.expenses.length === 0) {
            console.log('No expenses to summarize.');
            return;
        }

        //Calculate total expenses and expenses by category
        const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        console.log(`Total Expenses: $${total.toFixed(2)}`);
        const categories = {};
        this.expenses.forEach(exp => {
            categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
        });
        console.log('Expenses by Category:');

        //loop through the categories and display the amount
        for (const [category, amount] of Object.entries(categories)) {
            console.log(`${category}: $${amount.toFixed(2)}`);
        }
    }

    // Delete an expense by ID
    async deleteExpense() {
        const id = parseInt(await this.askInputQuestion('Enter expense ID to delete (Use option 2 to view all IDs): '));
        const initialLength = this.expenses.length;
        this.expenses = this.expenses.filter(exp => exp.id !== id);
        if (this.expenses.length < initialLength) {
            await this.saveExpenses();
            console.log('Expense deleted successfully.');
        } else {
            console.log('Expense not found.');
        }
    }

    // Helper function to ask questions
    askInputQuestion(query) {
        return new Promise(resolve => this.readLineInt.question(query, resolve));
    }

    // Close the readline interface
    close() {
        this.readLineInt.close();
    }
}

// Main function to run the application
async function main() {
    const tracker = new ExpenseTracker('expenses.json');
    await tracker.loadExpenses();

    while (true) {
        console.log('\n--- Expense Tracker Menu ---');
        console.log('1. Add an Expense');
        console.log('2. View All Expenses');
        console.log('3. Filter Expenses');
        console.log('4. View Summary');
        console.log('5. Delete Expense');
        console.log('6. Exit');
        const choice = await tracker.askInputQuestion('Choose an option: ');

        switch (choice) {
            case '1':
                await tracker.addExpenses();
                break;
            case '2':
                tracker.viewExpenses();
                break;
            case '3':
                await tracker.filterExpenses();
                break;
            case '4':
                tracker.viewSummaryByCategoryAndTotal();
                break;
            case '5':
                await tracker.deleteExpense();
                break;
            case '6':
                tracker.close();
                console.log('Thanks for running the Application, Have a nice day!');
                return;
            default:
                console.log('You have selected an invalid option. Please enter a number between 1 and 6.');
        }
    }
}

// Run the main function if this file is executed directly
if (require.main === module) {
    main();
} else {
    module.exports = ExpenseTracker;
}
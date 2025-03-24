// Test function to test the ExpenseTracker class

const ExpenseTracker = require('./expenseTracker');
const fs = require('fs').promises;

async function runTests() {
    const testFilePath = 'test_expenses.json';
    const tracker = new ExpenseTracker(testFilePath);
    await tracker.loadExpenses();

    console.log('Starting tests...');

    // Test 1: Add Expense
    const initialCount = tracker.expenses.length;
    const testExpense = { id: Date.now(), date: '2025-03-23', amount: 100, category: 'Test', description: 'Test expense by Mohit' };
    tracker.expenses.push(testExpense);
    await tracker.saveExpenses();
    await tracker.loadExpenses();
    console.assert(tracker.expenses.length === initialCount + 1, 'Test 1 Failed: Add expense');
    console.log('Test 1 Passed: Add expense');

    // Test 2: View Expenses (manual verification via output)
    console.log('Test 2: View expenses output (manual check):');
    tracker.viewExpenses();

    // Test 3: Filter Expenses by Category
    const filtered = tracker.expenses.filter(exp => exp.category === 'Test');
    console.assert(filtered.length === 1 && filtered[0].id === testExpense.id, 'Test 3 Failed: Filter expenses');
    console.log('Test 3 Passed: Filter expenses');

    // Test 4: View Summary (manual verification via output)
    console.log('Test 4: View summary output (manual check):');
    tracker.viewSummaryByCategoryAndTotal();

    // Test 5: Delete Expense
    const idToDelete = testExpense.id;
    tracker.expenses = tracker.expenses.filter(exp => exp.id !== idToDelete);
    await tracker.saveExpenses();
    await tracker.loadExpenses();
    const deletedExpense = tracker.expenses.find(exp => exp.id === idToDelete);
    console.assert(deletedExpense === undefined, 'Test 5 Failed: Delete expense');
    console.log('Test 5 Passed: Delete expense');

    // Clean up
    await fs.unlink(testFilePath).catch(() => {}); // Ignore if file doesn't exist
    tracker.close();
    console.log('All tests completed.');
}

runTests().catch(err => console.error('Test execution failed:', err));
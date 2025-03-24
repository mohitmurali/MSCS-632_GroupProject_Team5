# MSCS 632 - Advanced Programming Languages
# Group Project - Expense Tracker
# Group 5: Mohit Gokul Murali, Shilpa Mesineni
# Date: March 23, 2025

import json
from datetime import datetime

# ExpenseTracker class to manage expenses in daily life
class ExpenseTracker:
    def __init__(self, fileLocation):
        self.fileLocation = fileLocation

        # contains dictionaries, where each dictionary represents an expense with keys
        self.expenses = []
        # Predefined categories
        self.categories = ['Food', 'Groceries', 'Transportation', 'Entertainment', 'Bills', 'Utilities', 'Other']

    # Load expenses initially from the JSON file into memory which is stored locally
    # JSON file is used to store the expenses in the local storage - JSON file is saved as expenses.json
    def loadExpenses(self):
        try:
            with open(self.fileLocation, 'r') as file:
                self.expenses = json.load(file)
        except FileNotFoundError:
            self.expenses = []  # File doesn't exist, start with an empty list
        except Exception as error:
            print('Error loading expenses:', error)  # show error if any

    # Save expenses to the JSON file in the local storage
    def saveExpenses(self):
        try:
            with open(self.fileLocation, 'w') as file:
                json.dump(self.expenses, file, indent=2)
        except Exception as error:
            print('Error saving the expenses, try again:', error)

    # Function to add the expenses with predefined categories
    def addExpenses(self):
        date = self.askInputQuestion('Enter the date (YYYY-MM-DD): ')
        # Validate date format using datetime
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            print('Invalid input (date must be YYYY-MM-DD). Expense was not added.')
            return

        amount_input = self.askInputQuestion('Enter an amount: ')
        try:
            amount = float(amount_input)  # Dynamic typing: convert string to float
        except ValueError:
            print('Invalid input (amount must be a number). Expense was not added.')
            return

        # Display categories and prompt for selection
        print('Select a category:')
        for index, cat in enumerate(self.categories, 1):
            print(f'{index}. {cat}')
        category_index_input = self.askInputQuestion('Enter category number: ')
        try:
            category_index = int(category_index_input) - 1
            category = self.categories[category_index] if 0 <= category_index < len(self.categories) else None
        except ValueError:
            category = None

        if not category:
            print('Invalid input (category must be valid). Expense was not added.')
            return

        description = self.askInputQuestion('Enter the expense description: ')

        # Create expense dictionary with current timestamp as ID
        expense = {
            'id': int(datetime.now().timestamp() * 1000),  # Milliseconds for uniqueness
            'date': date,
            'amount': amount,
            'category': category,
            'description': description
        }

        # Add the expense to the list
        self.expenses.append(expense)
        self.saveExpenses()

        # Confirmation message
        print('Expense was added successfully.')

    # View all expenses in the list by ID, Date, Amount, Category and Description
    def viewExpenses(self):
        if not self.expenses:
            print('No expenses were found.')
        else:
            print('Expenses:')
            for exp in self.expenses:
                print(f"ID: {exp['id']}, Date: {exp['date']}, Amount: ${exp['amount']:.2f}, Category: {exp['category']}, Description: {exp['description']}")

    # Filter expenses by date or category
    def filterExpenses(self):
        filterBy = self.askInputQuestion('Filter using (date/category): ')
        filtered = self.expenses

        # Filter by date
        # Dates are parsed into datetime objects for comparison
        if filterBy == 'date':
            startDate = self.askInputQuestion('Enter start date (YYYY-MM-DD) of the expense: ')
            try:
                start_date_dt = datetime.strptime(startDate, '%Y-%m-%d')
                filtered = [exp for exp in self.expenses if datetime.strptime(exp['date'], '%Y-%m-%d') == start_date_dt]
            except ValueError:
                print('Invalid date format (must be YYYY-MM-DD).')
                return

        # Filter by category
        elif filterBy == 'category':
            # Display categories and prompt for selection
            print('Select a category to filter by:')
            for index, cat in enumerate(self.categories, 1):
                print(f'{index}. {cat}')
            category_index_input = self.askInputQuestion('Enter category number: ')
            try:
                category_index = int(category_index_input) - 1
                if 0 <= category_index < len(self.categories):
                    category = self.categories[category_index]
                    filtered = [exp for exp in self.expenses if exp['category'] == category]
                else:
                    print('Invalid category selected.')
                    return
            except ValueError:
                print('Invalid category selected.')
                return

        # Invalid filter - return error
        else:
            print('Invalid filter selected. Please enter "date" or "category".')
            return

        # Display null message if no expenses found
        if not filtered:
            print('There are no expenses that match the filter.')
        
        # Else show the filtered expenses
        else:
            print('Filtered Expenses:')
            for exp in filtered:
                print(f"ID: {exp['id']}, Date: {exp['date']}, Amount: ${exp['amount']:.2f}, Category: {exp['category']}, Description: {exp['description']}")

    # View summary of expenses by category and total
    def viewSummaryByCategoryAndTotal(self):
        if not self.expenses:
            print('No expenses to summarize.')
            return

        # Calculate total expenses and expenses by category
        total = sum(exp['amount'] for exp in self.expenses)
        print(f'Total Expenses: ${total:.2f}')
        categories = {}

        # a dictionary (categories) dynamically accumulates the total expenses per category using the .get() method
        for exp in self.expenses:
            categories[exp['category']] = categories.get(exp['category'], 0) + exp['amount']
        print('Expenses by Category:')

        # loop through the categories and display the amount
        for category, amount in categories.items():
            print(f'{category}: ${amount:.2f}')

    # Delete an expense by ID
    def deleteExpense(self):
        id_input = self.askInputQuestion('Enter expense ID to delete (Use option 2 to view all IDs): ')
        try:
            id = int(id_input)
            initialLength = len(self.expenses)
            self.expenses = [exp for exp in self.expenses if exp['id'] != id]
            if len(self.expenses) < initialLength:
                self.saveExpenses()
                print('Expense deleted successfully.')
            else:
                print('Expense not found.')
        except ValueError:
            print('Invalid ID (must be a number).')

    # Helper function to ask questions
    def askInputQuestion(self, query):
        return input(query)

# Main function to run the application
def main():
    tracker = ExpenseTracker('expenses.json')
    tracker.loadExpenses()

    while True:
        print('\n--- Expense Tracker Menu ---')
        print('1. Add an Expense')
        print('2. View All Expenses')
        print('3. Filter Expenses')
        print('4. View Summary')
        print('5. Delete Expense')
        print('6. Exit')
        choice = tracker.askInputQuestion('Choose an option: ')

        if choice == '1':
            tracker.addExpenses()
        elif choice == '2':
            tracker.viewExpenses()
        elif choice == '3':
            tracker.filterExpenses()
        elif choice == '4':
            tracker.viewSummaryByCategoryAndTotal()
        elif choice == '5':
            tracker.deleteExpense()
        elif choice == '6':
            print('Thanks for running the Application, Have a nice day!')
            break
        else:
            print('You have selected an invalid option. Please enter a number between 1 and 6.')

# Run the main function if this file is executed directly
if __name__ == '__main__':
    main()
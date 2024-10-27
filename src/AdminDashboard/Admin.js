// Data storage for items and users
let items = [];
let users = [];

// Function to add item
function addItem() {
    const title = document.getElementById('item-title').value;
    const type = document.getElementById('item-type').value;
    const copies = document.getElementById('item-copies').value;

    const newItem = { id: Date.now(), title, type, copies: parseInt(copies) };
    items.push(newItem);
    displayItems();
    clearItemForm();
}

// Function to display items
function displayItems() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.innerHTML = `
            ${item.title} - ${item.type} - Copies: ${item.copies}
            <button class="update-btn" onclick="updateCopies(${item.id})">Update Copies</button>
            <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        `;
        itemList.appendChild(itemElement);
    });
}

// Function to update copies
function updateCopies(id) {
    const newCopies = prompt('Enter new number of copies:');
    const item = items.find(i => i.id === id);
    if (item) {
        item.copies = parseInt(newCopies);
        displayItems();
    }
}

// Function to delete item
function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    displayItems();
}

// Clear item form
function clearItemForm() {
    document.getElementById('item-title').value = '';
    document.getElementById('item-type').value = '';
    document.getElementById('item-copies').value = '';
}

// Function to add user
function addUser() {
    const name = document.getElementById('user-name').value;
    const borrowingLimit = document.getElementById('borrowing-limit').value;

    const newUser = { id: Date.now(), name, borrowingLimit: parseInt(borrowingLimit), fines: 0 };
    users.push(newUser);
    displayUsers();
    clearUserForm();
}

// Function to display users
function displayUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('li');
        userElement.innerHTML = `
            ${user.name} - Borrowing Limit: ${user.borrowingLimit}, Fines: $${user.fines}
            <button class="update-btn" onclick="updateBorrowingLimit(${user.id})">Edit Borrowing Limit</button>
            <button class="delete-btn" onclick="clearFines(${user.id})">Clear Fines</button>
        `;
        userList.appendChild(userElement);
    });
}

// Function to update borrowing limit
function updateBorrowingLimit(id) {
    const newLimit = prompt('Enter new borrowing limit:');
    const user = users.find(u => u.id === id);
    if (user) {
        user.borrowingLimit = parseInt(newLimit);
        displayUsers();
    }
}

// Function to clear fines
function clearFines(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        user.fines = 0;
        displayUsers();
    }
}

// Clear user form
function clearUserForm() {
    document.getElementById('user-name').value = '';
    document.getElementById('borrowing-limit').value = '';
}

let myChart; // Define myChart variable to hold the chart instance globally

let customers = [];
let transactions = [];

// Get references to HTML elements
const transactionTableBody = document.getElementById('transactionTableBody');
const customerName = document.getElementById('customerName');
const transactionAmount = document.getElementById('transactionAmount');
const transactionChart = document.getElementById('transactionChart').getContext('2d');

async function getData() {
    let api = await fetch('https://raw.githubusercontent.com/omareldesokyy/TransactionsViewer/main/data/data.json');
    return await api.json();
}

getData().then((data) => {

    customers = data.customers;
    transactions = data.transactions;

    // Function to update table and graph based on filters
    function updateData() {

        const customerNameFilter = customerName.value.toLowerCase();
        const transactionAmountValue = transactionAmount.value;


        const filteredTransactions = transactions.filter(transaction => {

            const customer = customers.find(cust => cust.id === transaction.customer_id);

            const customerName = customer.name.toLowerCase();
            const transactionAmount = String(transaction.amount);

            return customerName.includes(customerNameFilter) && transactionAmount.includes(transactionAmountValue);
        });

        // Update table with filtered data
        fillTable(filteredTransactions);

        // Update graph with total transaction amount per day for selected customer
        updateGraph(filteredTransactions);
    }


    // Initial population of table and graph
    fillTable(transactions);
    updateGraph(transactions);

    // Event listeners for filters
    customerName.addEventListener('input', updateData);
    transactionAmount.addEventListener('input', updateData);
})


// Function to populate the table with data
function fillTable(filteredTransactions) {
    transactionTableBody.innerHTML = '';
    let transactionsData = '';
    filteredTransactions.forEach(transaction => {
        const customer = customers.find(cust => cust.id === transaction.customer_id);
        transactionsData += `
            <tr>
                <td>${customer.name}</td>
                <td>${transaction.date}</td>
                <td>${transaction.amount}</td>
            </tr>
        `;
    });

    transactionTableBody.innerHTML = transactionsData;
}

// Function to update the graph
function updateGraph(filteredTransactions) {

    //Using Set to remove duplicates
    const dates = [...new Set(filteredTransactions.map(transaction => transaction.date))];
    const customerTransactions = {};

    dates.forEach(date => {
        customerTransactions[date] = 0;
    });

    filteredTransactions.forEach(transaction => {
        customerTransactions[transaction.date] += transaction.amount;
    });

    const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
    const amounts = sortedDates.map(date => customerTransactions[date]);

    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    // Create new chart
    myChart = new Chart(transactionChart, {
        type: 'bar',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Total Amount',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


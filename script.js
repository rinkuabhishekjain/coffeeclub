// Set current year in footer
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Newsletter form handler
function handleNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button');
    
    // Simulate API call
    button.textContent = 'Subscribing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = 'Subscribed!';
        button.style.backgroundColor = '#22c55e';
        form.querySelector('input[type="email"]').value = '';
        
        setTimeout(() => {
            button.textContent = 'Subscribe';
            button.disabled = false;
            button.style.backgroundColor = '';
        }, 3000);
    }, 1000);
}


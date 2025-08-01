document.querySelector('.account').addEventListener('click', function(event) {
    event.stopPropagation();
    document.querySelector('.dropdown-menu').classList.toggle('show');
});

document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-menu');
    if (!dropdown.contains(event.target) && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});
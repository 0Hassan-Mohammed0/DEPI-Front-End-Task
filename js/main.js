$(function () {
    initializePage();
});

function initializePage() {
    checkSavedTheme();

    const themeSwitcherButton = document.getElementById('theme-switcher');
    themeSwitcherButton.addEventListener('click', handleThemeToggle);

    window.addEventListener('hashchange', router);
    router();
}

function handleThemeToggle() {
    const body = $('body');
    body.toggleClass('dark-mode');

    if (body.hasClass('dark-mode')) {
        $('#theme-switcher i').removeClass('fa-sun').addClass('fa-moon');
        localStorage.setItem('theme', 'dark');
    } else {
        $('#theme-switcher i').removeClass('fa-moon').addClass('fa-sun');
        localStorage.setItem('theme', 'light');
    }
}

function checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        $('body').addClass('dark-mode');
        $('#theme-switcher i').removeClass('fa-sun').addClass('fa-moon');
    }
}

function router() {
    const hash = window.location.hash || '#dashboard';
    
    $('.navbar-nav .nav-link').removeClass('active');
    $(`.navbar-nav .nav-link[href="${hash}"]`).addClass('active');

    const contentArea = $('#content-area');
    contentArea.html('');

    switch (hash) {
        case '#dashboard':
            loadDashboard();
            break;
        case '#users':
            loadUsersPage();
            break;
        case '#posts':
            loadPostsPage();
            break;
        default:
            contentArea.html('<h1>404 - Page Not Found</h1>');
    }
}

function showStyledAlert(title, text, icon) {
    const isDarkMode = $('body').hasClass('dark-mode');
    
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        background: isDarkMode ? '#04471C' : '#fff',
        color: isDarkMode ? '#fff' : '#545454',
        confirmButtonColor: '#058C42',
        confirmButtonText: 'Great!'
    });
}
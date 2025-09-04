function loadUsersPage() {
    const contentArea = $('#content-area');
    const loader = $('#loader');

    loader.show();
    contentArea.hide();

    const tableHtml = `
        <div class="container-fluid">
            <h1 class="mb-4">Users Management</h1>
            <div class="card shadow-sm">
                <div class="card-body">
                    <table id="usersTable" class="table table-striped table-hover" style="width:100%">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    contentArea.html(tableHtml);

    $.get("https://jsonplaceholder.typicode.com/users")
        .done(function(users) {
            const favorites = getFavorites();

            if ($.fn.DataTable.isDataTable('#usersTable')) {
                $('#usersTable').DataTable().destroy();
            }

            const dataTable = $('#usersTable').DataTable({
                "data": users,
                "columns": [
                    { "data": "id" },
                    { "data": "name" },
                    { "data": "username" },
                    { "data": "email" },
                    { "data": "phone" },
                    {
                        "data": null,
                        "orderable": false,
                        "render": function(data, type, row) {
                            const isFavorite = favorites.includes(row.id);
                            const starIcon = isFavorite ? 'fas fa-star' : 'far fa-star';
                            const favoriteClass = isFavorite ? 'is-favorite' : '';

                            return `
                                <button class="btn btn-sm btn-primary view-btn" data-user-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-info edit-btn" data-user-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger delete-btn" data-user-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning favorite-btn ${favoriteClass}" data-user-id="${row.id}" data-bs-toggle="tooltip" data-bs-placement="top">
                                    <i class="${starIcon}"></i>
                                </button>
                            `;
                        }
                    }
                ],
                "responsive": true,
                "drawCallback": function() {
                    initTooltips();
                }
            });

            loader.hide();
            contentArea.fadeIn();

            initTooltips();

        })
        .fail(function() {
            loader.hide();
            contentArea.html('<div class="alert alert-danger">Could not load users. Please try again later.</div>').fadeIn();
            showStyledAlert('Error!', 'Failed to fetch user data from the API.', 'error');
        });
}

function initTooltips() {
    $('[data-bs-toggle="tooltip"]').tooltip('dispose');
    $('[data-bs-toggle="tooltip"]').tooltip();
}

function getFavorites() {
    const favorites = localStorage.getItem('favoriteUsers');
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('favoriteUsers', JSON.stringify(favorites));
}

$(document).on('click', '#usersTable tbody button', function() {
    const button = $(this);
    const userId = button.data('user-id');
    const table = $('#usersTable').DataTable();
    const row = button.closest('tr');

    if (button.hasClass('view-btn')) {
        viewUser(userId);
    } else if (button.hasClass('edit-btn')) {
        editUser(userId, table, row);
    } else if (button.hasClass('delete-btn')) {
        deleteUser(userId, table, row);
    } else if (button.hasClass('favorite-btn')) {
        toggleFavorite(userId, button);
    }
});

function toggleFavorite(userId, button) {
    let favorites = getFavorites();
    if (favorites.includes(userId)) {
        favorites = favorites.filter(id => id !== userId);
        button.removeClass('is-favorite');
        button.find('i').removeClass('fas fa-star').addClass('far fa-star');
    } else {
        favorites.push(userId);
        button.addClass('is-favorite');
        button.find('i').removeClass('far fa-star').addClass('fas fa-star');
    }
    saveFavorites(favorites);
}

function viewUser(userId) {
    const isDarkMode = $('body').hasClass('dark-mode');
    $.get(`https://jsonplaceholder.typicode.com/users/${userId}`)
        .done(function(user) {
            const userDetailsHtml = `
                <div style="text-align: left; padding: 1rem;">
                    <p><strong>ID:</strong> ${user.id}</p><p><strong>Name:</strong> ${user.name}</p><p><strong>Username:</strong> ${user.username}</p><p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p><hr>
                    <p><strong>Address:</strong> ${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}</p><p><strong>Phone:</strong> ${user.phone}</p><p><strong>Website:</strong> <a href="http://${user.website}" target="_blank">${user.website}</a></p><hr>
                    <p><strong>Company:</strong> ${user.company.name}</p>
                </div>`;
            Swal.fire({
                title: `<i class="fas fa-user-circle"></i> ${user.name}`,
                html: userDetailsHtml,
                width: '600px',
                background: isDarkMode ? '#04471C' : '#fff',
                color: isDarkMode ? '#fff' : '#545454',
                confirmButtonColor: '#058C42',
                confirmButtonText: 'Close'
            });
        })
        .fail(function() {
            showStyledAlert('Error!', 'Could not fetch user details. Please try again.', 'error');
        });
}

function editUser(userId, table, row) {
    const isDarkMode = $('body').hasClass('dark-mode');

    $.get(`https://jsonplaceholder.typicode.com/users/${userId}`)
        .done(function(user) {
            Swal.fire({
                title: `Edit ${user.name}`,
                background: isDarkMode ? '#04471C' : '#fff',
                color: isDarkMode ? '#fff' : '#545454',
                html: `
                    <form id="editUserForm" class="text-start">
                        <div class="mb-3">
                            <label for="name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="name" value="${user.name}">
                        </div>
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" value="${user.username}">
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" value="${user.email}">
                        </div>
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone</label>
                            <input type="text" class="form-control" id="phone" value="${user.phone}">
                        </div>
                    </form>
                `,
                confirmButtonText: 'Save Changes',
                confirmButtonColor: '#058C42',
                showCancelButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    const updatedUser = {
                        name: $('#name').val(),
                        username: $('#username').val(),
                        email: $('#email').val(),
                        phone: $('#phone').val()
                    };
                    return updatedUser;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedUserData = result.value;
                    
                    $.ajax({
                        url: `https://jsonplaceholder.typicode.com/users/${userId}`,
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(updatedUserData),
                        success: function(response) {
                            const originalData = table.row(row).data();
                            const finalData = { ...originalData, ...response };
                            table.row(row).data(finalData).draw();

                            showStyledAlert('Updated!', 'The user information has been saved.', 'success');
                        },
                        error: function() {
                            showStyledAlert('Error!', 'Could not save the changes.', 'error');
                        }
                    });
                }
            });
        })
        .fail(function() {
            showStyledAlert('Error!', 'Could not fetch user data for editing.', 'error');
        });
}

function deleteUser(userId, table, row) {
    const isDarkMode = $('body').hasClass('dark-mode');
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        background: isDarkMode ? '#04471C' : '#fff',
        color: isDarkMode ? '#fff' : '#545454',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `https://jsonplaceholder.typicode.com/users/${userId}`,
                type: 'DELETE',
                success: function(result) {
                    table.row(row).remove().draw();
                    showStyledAlert('Deleted!', 'The user has been deleted.', 'success');
                },
                error: function() {
                    showStyledAlert('Error!', 'Could not delete the user.', 'error');
                }
            });
        }
    });
}
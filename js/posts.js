let currentPage = 1;
const postsPerPage = 9;

function loadPostsPage() {
    const contentArea = $('#content-area');
    const loader = $('#loader');

    loader.show();
    contentArea.hide();

    const pageHtml = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1>Posts</h1>
                <button class="btn btn-success" id="addPostBtn">
                    <i class="fas fa-plus"></i> Add New Post
                </button>
            </div>
            <div class="mb-4">
                <input type="text" id="postSearch" class="form-control" placeholder="Search for posts by title...">
            </div>
            <div id="posts-container" class="row"></div>
            <div id="posts-pagination" class="d-flex justify-content-center align-items-center mt-4">
                <button class="btn btn-secondary" id="prev-page-btn" disabled>&laquo; Previous</button>
                <span class="mx-3" id="page-info"></span>
                <button class="btn btn-secondary" id="next-page-btn">Next &raquo;</button>
            </div>
            <hr>
        </div>
    `;
    contentArea.html(pageHtml);

    return $.get("https://jsonplaceholder.typicode.com/posts")
        .done(function(posts) {
            window.postsData = posts;
            currentPage = 1;
            renderPosts(currentPage);
            updatePaginationControls();

            loader.hide();
            contentArea.fadeIn();
        })
        .fail(function() {
            loader.hide();
            contentArea.html('<div class="alert alert-danger">Could not load posts.</div>').fadeIn();
            showStyledAlert('Error!', 'Failed to fetch posts from the API.', 'error');
        });
}

function renderPosts(page) {
    const postsContainer = $('#posts-container');
    postsContainer.empty();

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = window.postsData.slice(startIndex, endIndex);

    postsToShow.forEach(function(post) {
        const postCardHtml = `
            <div class="col-md-6 col-lg-4 mb-4 post-card" data-post-id="${post.id}">
                <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${post.title}</h5>
                        <div class="post-body">
                            <p class="card-text text-muted flex-grow-1 post-snippet">${post.body.substring(0, 100)}...</p>
                            <p class="card-text text-muted flex-grow-1 post-full" style="display:none;">${post.body}</p>
                        </div>
                        <div class="mt-auto">
                            <button class="btn btn-sm btn-secondary read-more-btn">Read More</button>
                        </div>
                        <hr>
                        <div>
                            <button class="btn btn-sm btn-primary view-comments-btn" data-post-id="${post.id}">View Comments</button>
                            <button class="btn btn-sm btn-info edit-post-btn" data-post-id="${post.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-post-btn" data-post-id="${post.id}">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        postsContainer.append(postCardHtml);
    });
}

function updatePaginationControls() {
    const totalPages = Math.ceil(window.postsData.length / postsPerPage);
    $('#page-info').text(`Page ${currentPage} of ${totalPages}`);

    $('#prev-page-btn').prop('disabled', currentPage === 1);
    $('#next-page-btn').prop('disabled', currentPage === totalPages);
}

$(document).on('keyup', '#postSearch', function() {
    const searchTerm = $(this).val().toLowerCase();

    if (searchTerm === '') {
        renderPosts(currentPage);
        updatePaginationControls();
        $('#posts-pagination').show();
    } else {
        const filteredPosts = window.postsData.filter(post => post.title.toLowerCase().includes(searchTerm));
        renderPostsFromList(filteredPosts);
        $('#posts-pagination').hide();
    }
});

function renderPostsFromList(posts) {
    const postsContainer = $('#posts-container');
    postsContainer.empty();
    posts.forEach(function(post) {
        const postCardHtml = `
            <div class="col-md-6 col-lg-4 mb-4 post-card" data-post-id="${post.id}">
                 <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${post.title}</h5>
                        <div class="post-body">
                            <p class="card-text text-muted flex-grow-1 post-snippet">${post.body.substring(0, 100)}...</p>
                            <p class="card-text text-muted flex-grow-1 post-full" style="display:none;">${post.body}</p>
                        </div>
                        <div class="mt-auto">
                            <button class="btn btn-sm btn-secondary read-more-btn">Read More</button>
                        </div>
                        <hr>
                        <div>
                            <button class="btn btn-sm btn-primary view-comments-btn" data-post-id="${post.id}">View Comments</button>
                            <button class="btn btn-sm btn-info edit-post-btn" data-post-id="${post.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-post-btn" data-post-id="${post.id}">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`;
        postsContainer.append(postCardHtml);
    });
}

$(document).on('click', '#content-area button', function() {
    const button = $(this);
    const postId = button.data('post-id');
    const card = button.closest('.post-card');

    if (button.attr('id') === 'addPostBtn') {
        addPost();
    } else if (button.hasClass('view-comments-btn')) {
        viewComments(postId);
    } else if (button.hasClass('edit-post-btn')) {
        editPost(postId);
    } else if (button.hasClass('delete-post-btn')) {
        deletePost(postId);
    } else if (button.hasClass('read-more-btn')) {
        const snippet = card.find('.post-snippet');
        const full = card.find('.post-full');
        if (full.is(':visible')) {
            snippet.show();
            full.hide();
            button.text('Read More');
        } else {
            snippet.hide();
            full.show();
            button.text('Read Less');
        }
    } else if (button.attr('id') === 'prev-page-btn') {
        if (currentPage > 1) {
            currentPage--;
            renderPosts(currentPage);
            updatePaginationControls();
        }
    } else if (button.attr('id') === 'next-page-btn') {
        const totalPages = Math.ceil(window.postsData.length / postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPosts(currentPage);
            updatePaginationControls();
        }
    }
});

function viewComments(postId) {
    const isDarkMode = $('body').hasClass('dark-mode');
    Swal.fire({
        title: 'Loading Comments...',
        background: isDarkMode ? '#04471C' : '#fff',
        color: isDarkMode ? '#fff' : '#545454',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    $.get(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`)
        .done(function(comments) {
            let commentsHtml = '<div class="text-start" style="max-height: 400px; overflow-y: auto; padding: 1rem;">';
            if (comments.length > 0) {
                comments.forEach(function(comment) {
                    commentsHtml += `<div class="mb-3 border-bottom pb-2"><strong>${comment.email}</strong><p class="mb-0 mt-1">${comment.body}</p></div>`;
                });
            } else {
                commentsHtml += '<p>No comments found for this post.</p>';
            }
            commentsHtml += '</div>';

            Swal.fire({
                title: 'Comments',
                html: commentsHtml,
                width: '800px',
                background: isDarkMode ? '#04471C' : '#fff',
                color: isDarkMode ? '#fff' : '#545454',
                confirmButtonColor: '#058C42',
                confirmButtonText: 'Close'
            });
        })
        .fail(function() {
            showStyledAlert('Error!', 'Could not fetch comments.', 'error');
        });
}

function addPost() {
    const isDarkMode = $('body').hasClass('dark-mode');
    Swal.fire({
        title: 'Create a New Post',
        background: isDarkMode ? '#04471C' : '#fff',
        color: isDarkMode ? '#fff' : '#545454',
        html: `
            <form id="addPostForm" class="text-start">
                <div class="mb-3">
                    <label for="postTitle" class="form-label">Title</label>
                    <input type="text" class="form-control" id="postTitle" placeholder="Enter post title">
                </div>
                <div class="mb-3">
                    <label for="postBody" class="form-label">Body</label>
                    <textarea class="form-control" id="postBody" rows="5" placeholder="Enter post content"></textarea>
                </div>
            </form>
        `,
        confirmButtonText: 'Create Post',
        confirmButtonColor: '#058C42',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const title = $('#postTitle').val();
            const body = $('#postBody').val();
            if (!title || !body) {
                Swal.showValidationMessage(`Please enter both a title and a body`);
            }
            return { title: title, body: body };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newPost = {
                id: Date.now(),
                title: result.value.title,
                body: result.value.body
            };

            window.postsData.unshift(newPost);
            renderPosts(currentPage);
            updatePaginationControls();

            showStyledAlert('Success!', 'Your new post has been added locally.', 'success');
        }
    });
}

function editPost(postId) {
    const isDarkMode = $('body').hasClass('dark-mode');
    const post = window.postsData.find(p => p.id === postId);
    if (!post) return;

    Swal.fire({
        title: 'Edit Post',
        background: isDarkMode ? '#04471C' : '#fff',
        color: isDarkMode ? '#fff' : '#545454',
        html: `
            <form id="editPostForm" class="text-start">
                <div class="mb-3">
                    <label for="editPostTitle" class="form-label">Title</label>
                    <input type="text" class="form-control" id="editPostTitle" value="${post.title}">
                </div>
                <div class="mb-3">
                    <label for="editPostBody" class="form-label">Body</label>
                    <textarea class="form-control" id="editPostBody" rows="5">${post.body}</textarea>
                </div>
            </form>
        `,
        confirmButtonText: 'Save Changes',
        confirmButtonColor: '#058C42',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const title = $('#editPostTitle').val();
            const body = $('#editPostBody').val();
            if (!title || !body) {
                Swal.showValidationMessage(`Title and body cannot be empty`);
            }
            return { title: title, body: body };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            post.title = result.value.title;
            post.body = result.value.body;

            renderPosts(currentPage);

            showStyledAlert('Saved!', 'Your changes have been saved locally.', 'success');
        }
    });
}

function deletePost(postId) {
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
            window.postsData = window.postsData.filter(p => p.id !== postId);
            renderPosts(currentPage);
            updatePaginationControls();
            
            showStyledAlert('Deleted!', 'The post has been deleted locally.', 'success');
        }
    });
}
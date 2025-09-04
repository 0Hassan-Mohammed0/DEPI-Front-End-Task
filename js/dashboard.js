function loadDashboard() {
    const contentArea = $('#content-area');
    const loader = $('#loader');

    loader.show();
    contentArea.hide();

    $.when(
        $.get("https://jsonplaceholder.typicode.com/users"),
        $.get("https://jsonplaceholder.typicode.com/posts"),
        $.get("https://jsonplaceholder.typicode.com/comments")
    ).done(function(usersResponse, postsResponse, commentsResponse) {
        const users = usersResponse[0];
        const allPosts = postsResponse[0];
        const commentsCount = commentsResponse[0].length;
        const usersCount = users.length;
        const postsCount = allPosts.length;

        const userMap = new Map(users.map(user => [user.id, user.name]));
        
        const recentPosts = allPosts.slice(-10).reverse();
        const recentUsers = users.slice(-5).reverse();

        const dashboardHtml = `
            <div class="d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeInDown">
                <h1>Dashboard</h1>
                <span class="text-muted">Welcome, Admin!</span>
            </div>

            <div class="row">
                <div class="col-lg-8">
                    <div class="card shadow-sm mb-4 animate__animated animate__fadeInUp">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0"><i class="fas fa-newspaper me-2"></i>Recent Posts</h5>
                            <a href="#posts" class="btn btn-sm btn-outline-primary">View All Posts</a>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Author</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${recentPosts.map(post => `
                                            <tr>
                                                <td>${post.title.substring(0, 40)}...</td>
                                                <td>${userMap.get(post.userId) || 'Unknown User'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="card text-white bg-primary shadow mb-4 animate__animated animate__fadeInRight">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fs-4 fw-bold">${usersCount}</div>
                                <div>Total Users</div>
                            </div>
                            <i class="fas fa-users fa-3x text-white-50"></i>
                        </div>
                    </div>
                    <div class="card text-white bg-success shadow mb-4 animate__animated animate__fadeInRight" style="animation-delay: 0.2s;">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fs-4 fw-bold">${postsCount}</div>
                                <div>Total Posts</div>
                            </div>
                            <i class="fas fa-paste fa-3x text-white-50"></i>
                        </div>
                    </div>
                    
                    <div class="card text-white bg-info shadow mb-4 animate__animated animate__fadeInRight" style="animation-delay: 0.4s;">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fs-4 fw-bold">${commentsCount}</div>
                                <div>Total Comments</div>
                            </div>
                            <i class="fas fa-comments fa-3x text-white-50"></i>
                        </div>
                    </div>
                    
                    <div class="card shadow-sm mb-4 animate__animated animate__fadeInUp" style="animation-delay: 0.6s;">
                         <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0"><i class="fas fa-user-plus me-2"></i>Newest Users</h5>
                            <a href="#users" class="btn btn-sm btn-outline-primary">View All Users</a>
                        </div>
                        <ul class="list-group list-group-flush">
                            ${recentUsers.map(user => `
                                <li class="list-group-item">${user.name}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        loader.hide();
        contentArea.html(dashboardHtml).fadeIn();
        
    }).fail(function() {
        loader.hide();
        contentArea.html('<div class="alert alert-danger">Could not load dashboard data. Please check your connection and try again.</div>').fadeIn();
    });
}
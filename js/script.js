function AppViewModel() {
    var self = this;
    var ENDPOINT_GITHUB_USER = "https://api.github.com/users/";

    self.git_user = ko.observable();
    self.search_user = ko.observable();
    self.input_warning = ko.observable(false);
    self.has_user_data = ko.observable(false);
    self.user_not_found = ko.observable(false);
    self.repos_amount = ko.observable();
    self.repos_amount_text = ko.pureComputed(function () {
        return "Repositórios (" + self.repos_amount() + ")";
    });
    self.object_data_user = ko.observable({
        login: "",
        html_url: "",
        avatar_url: ""
    });
    self.object_user_repos = ko.observableArray([{
        link: "",
        name: ""
    }])

    self.hasFocus = function () {
        self.input_warning(false);
    }

    self.validateUser = function () {
        self.has_user_data(false);
        self.user_not_found(false);
        self.input_warning(false);

        var git_user = self.git_user();

        if (!git_user) {
            self.input_warning(false);
        }
        else if (git_user) {
            var regex = new RegExp("^[A-Za-z0-9]+$");
            var result = git_user.match(regex);
            if (!result) {
                self.input_warning(true);
            }
            else {
                self.searchUser();
            }
        }
    }

    self.searchUser = function () {
        $.ajax({
            type: 'GET',
            url: ENDPOINT_GITHUB_USER + self.git_user(),

            success: function (data) {
                self.getUser(data);
                if (data.public_repos === 0) {
                    self.cleanReposotories();
                    self.putUserDataOnScreen();
                }
                else {
                    self.searchRepos();
                }
            },
            error: function (e) {
                console.log(e);
                self.user_not_found(true);
            },
        });
    }

    self.searchRepos = function () {
        $.ajax({
            type: 'GET',
            url: ENDPOINT_GITHUB_USER + self.git_user() + '/repos',

            success: function (data) {
                if (data && data.length > 0) {
                    self.cleanReposotories();
                    self.getRepos(data);
                } else
                    return
            },
            error: function (e) {
                console.log(e);
                self.user_not_found(true);
            },
        });
    }

    self.cleanReposotories = function () {
        self.object_user_repos([]);
        self.object_user_repos([]);
    }

    self.getUser = function (data) {
        self.object_data_user().login = data.login;
        self.object_data_user().html_url = data.html_url;

        if (data.avatar_url)
            self.object_data_user().avatar_url = data.avatar_url;
        else
            self.object_data_user().avatar_url("https://www.och-lco.ca/wp-content/uploads/2015/07/unavailable-image-768x576.jpg");

        var object = {
            login: self.object_data_user().login,
            html_url: self.object_data_user().html_url,
            avatar_url: self.object_data_user().avatar_url
        }

        object.login = data.login;
        object.html_url = data.html_url;
        object.avatar_url = data.avatar_url;
    }

    self.getRepos = function (data) {
        self.repos_amount(data.length);
        self.object_user_repos().link = data.html_url;
        self.object_user_repos().name = data.name;

        var object_user_repos = {
            link: self.object_user_repos().link = data.html_url,
            name: self.object_user_repos().name = data.name
        };

        for (i = 0; i < data.length; i++) {
            object_user_repos[i] = {
                link: data[i].html_url,
                name: data[i].name
            }

            self.object_user_repos()[i] = {
                link: data[i].html_url,
                name: data[i].name
            }
        }
        self.putUserDataOnScreen();
    }

    self.putUserDataOnScreen = function () {
        self.has_user_data(true);
    }
}

const vm = new AppViewModel();
window.vm = vm;
ko.applyBindings(vm);
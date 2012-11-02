var BlogController = function() {

	this.urls = {
		'login' : '/login/',
		'newPost' : '/newpost/',
		'getBlogs' : '/blog/',
		'signUp' : '/signup/'
	};

	this.username = null;
	this.usernameAuthenticated = false;

	this.errorStyle = {
		"display" : "",
		"color" : "red",
		"margin-left" : "20%"
	};
	this.globalGetRequestOptions = {
		cache : false,
		type : 'GET',
		contentType : 'application/json'
	};

	this.setAuthenticatedState = function(authenticated) {
		this.usernameAuthenticated = authenticated;
	};

	this.isUserAuthenticated = function() {
		return this.usernameAuthenticated;
	}

	this.showLoginScreen = function() {
		//clear the user name and password values
		$("#username").attr('value', '');
		$("#password").attr('value', '');

		//Clear error message if any, and hide the div
		this.clearLoginErrorMsg(true);

		//Hide all other containers
		$(".container").css("display", "none");
		//show the login page
		$("#loginContainer").css("display", "");
		$("#username").focus();
	};

	this.clearLoginErrorMsg = function(hide) {
		$("loginErrorMsgDiv").html("");
		if (hide) {
			$("#loginErrorMsgDiv").css("display", "none");
		}
	}

	this.login = function() {
		var username = $("#username").val();
		var password = $("#password").val();
		this.username = username;

		//Clear error message if any, hide the error message div
		this.clearLoginErrorMsg(true);

		$.post(this.urls['login'], {
			"name" : username,
			"password" : password
		}, this.loginResponseHandler, "json");
	};

	this.loginResponseHandler = function(data) {
		var loginResult = data.hashedname;
		if (loginResult) {
			//Success - Set authenticated state
			blogController.setAuthenticatedState(true);
			//Valid result, login success, show the blogs list page
			blogController.getBlogs();
		} else {
			//Login failed - set state accordingly
			blogController.setAuthenticatedState(false);
			//Show error message in the login div
			$("#loginErrorMsgDiv").html("Invalid username or password. Try again!");
			$("#loginErrorMsgDiv").css({
				"display" : "",
				"color" : "red",
				"margin-left" : "20%"
			});
		}
	};

	this.showSignUp = function() {
		//clear the user name, password and email values
		$("#signUpUsername").attr('value', '');
		$("#signUpPassword").attr('value', '');
		$("#confirmPassword").attr('value', '');
		$("#email").attr('value', '');

		//Hide all other containers
		$(".container").css("display", "none");

		//Clear error message if any, and hide the div
		this.clearSignUpErrorMsg(true);

		//show the login page
		$("#signUpContainer").css("display", "");
		$("#username").focus();
	};

	this.signUp = function() {
		var username = $("#signUpUsername").val();
		var password = $("#signUpPassword").val();
		var confirmPass = $("#confirmPassword").val();
		var email = $("#email").val();

		if (!username || !password || !confirmPass) {
			//show error message
			$("#signUpErrorMsgDiv").html("Please enter valid values for all required fields!");
			$("#signUpErrorMsgDiv").css(this.errorStyle);
		} else if (password !== confirmPass) {
			$("#signUpErrorMsgDiv").html("Password fields do not match!");
			$("#signUpErrorMsgDiv").css(this.errorStyle);
		} else {
			//Submit the sign up form
			$.post(this.urls['signUp'], {
				"name" : username,
				"password" : password,
				"email" : email
			}, this.signUpResponseHandler, "json");

		}
	};

	this.signUpResponseHandler = function(data) {
		var signUpResult = data.hashedname;
		if (signUpResult) {
			//hide all containers
			$(".container").css("display", "none");

			//show the login screen
			blogController.showLoginScreen();
		} else {
			//Show error message in the signup div
			$("#signUpErrorMsgDiv").html("There was an error in the sign up process! Try again with a different username!");
			$("#signUpErrorMsgDiv").css(blogController.errorStyle);
		}
	};

	this.clearSignUpErrorMsg = function(hide) {
		$("#signUpErrorMsgDiv").html('');
		if (hide) {
			$("#signUpErrorMsgDiv").css("display", "none");
		}
	};

	this.getBlogs = function() {
		var url = this.urls['getBlogs'];
		$.ajax(url, this.globalGetRequestOptions).done(function(data) {

			//Hide all existing containers
			$(".container").css("display", "none");

			//Show the Blog list container with the buttons
			$("#blogsContainer").css("display", "");

			//setup the blog list
			$("#blogEntries").empty();
			$("#blogEntryTemplate").tmpl(data.blogs).appendTo("#blogEntries");
		});
	};

	this.showNewPostScreen = function() {
		if (this.isUserAuthenticated()) {
			//Hide all existing containers
			$(".container").css("display", "none");

			//Clear the new post form
			$("#title").attr("value", '');
			$("#content").attr("value", '');

			//Clear error message
			$("#newPostErrorMsgDiv").html('');
			$("#newPostErrorMsgDiv").css("display", "none");

			//Show the new post page
			$("#newPostContainer").css("display", "");

			$("#blogTitle").focus();
		}
	};

	this.postBlogEntry = function() {
		if (this.isUserAuthenticated()) {
			var blogTitle = $("#title").val();
			var blogContent = $("#content").val();
			var authorName = this.username;

			if (blogTitle && blogContent) {
				$.post(this.urls['newPost'], {
					"title" : blogTitle,
					"content" : blogContent,
					"name" : authorName
				}, this.newPostResponseHandler, "json");
			} else {
				$("#newPostErrorMsgDiv").html('Please enter valid values for all required fields.');
				$("#newPostErrorMsgDiv").css(this.errorStyle);
			}

		}
	};

	this.newPostResponseHandler = function(data) {
		//on success show blogs list page
		var test = data;
		console.log("received the post response..." + data);
		if (data && data.success == "yes") {
			//hide all containers
			$(".container").css("display", "none");

			//Show the blogs list page
			blogController.getBlogs();
		} else {

		}
		//on failure show error
	};

	this.logout = function() {
		//hide all existing containers
		$(".container").css("display", "none");

		//reset the blogController state

		//Clear the login page details and show it
		this.showLoginScreen();
	};
};

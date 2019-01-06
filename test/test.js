let Nightmare = require('nightmare')
let assert = require('assert')
let {expect} = require('chai');

describe('UI Flow Tests of Retireryte', function() {

	//
	//  setting a timeout to be 60s.
	//
	this.timeout('60s')

	//
	//  Setting up variable --visual for Every nighmare instance.
	//  If the variable value is true i.e. --visual, then `show` flag
	//  will be turned to true and vice-versa.
	//
	beforeEach(function() {
		//
		//	1.	By default we assume that we want to show the browser window.
		//
		let show_browser = false;

		//
		//	2. 	Parse the JSON arguments to a JS object.
		//
		let cli_options = JSON.parse(process.env.npm_config_argv);

		//
		//	Check if the test should be run visually or not.
		//

		//
		//	3.	Check the parameters and see if there is one that we recognize for --visual.
		//
		let cli_arguments = cli_options.original.filter(function(val) {
			return val == '--visual';
		})

		//
		//	4.	Check if we got an array of arguments, right now since we
		//		just support one, we don't check for the type. We just check
		//		if we have a match.
		//
		if(cli_arguments.length > 0)
		{
			show_browser = true;
		}

		//
		//	5.	Set the parameter and see if we can get the same for --env.
		//
		let cli_env = cli_options.original.filter(function(val) {

			return val.startsWith('--env')

		}).map(function(val) {

			return val.split("=")[1]

		});

		//
		//	6.	Check if URL is not Provided.
		//
		if(!cli_env.length)
		{
			throw Error('Please Enter URL with command like: npm test --env=https://access.retireryte.net --visual')
		}

		//
		//	7.	Pass the parameters to url.
		//
		url = cli_env[0];

		//
		//	8. Use the variable to configure Nightmare.
		//
		nightmare = Nightmare({
			show: show_browser,

			//
			// use the ignore-certificate-errors switch as documented
			// to ignore the ssl error. In case of any ssl certificate error
			// then electron will ignore the error.
			//
			switches: {
				'ignore-certificate-errors': true
			}

		});

	});

	//
	//  It is Test Suite for Opening website Retireryte on Browser.
	//
	describe('Home Page', function() {

		describe('/ (Load Home Page)', function() {

			it('should load without error', function(done) {

				nightmare
					.goto(url)
					.evaluate(() => {

						return document.title;

					})
					.end()
					.then((title) => {

						console.log(title);
						expect(title).to.equal('Retireryte - Access')
						done()

					})
					.catch(done)

			});

		});

	});

	//
	//  It is Test Suite for Verification of Login.
	//
	describe('Login', function() {

		describe('/ (Login with Wrong Email Address and Correct Pasasword)', function() {

			it('should get validation error message when Username is wrong.', function(done) {

				nightmare
					.goto(url)
					.type('input[id="inputUsername"]', 'yogesh01@mailinator.com')
					.type('input[id="inputPassword"]', 'Yogesh@123')
					.click('#signin')
					.evaluate(() => {

						return document.querySelector('#error_banner').innerText;

					})
					.end()
					.then((validation_message) => {

						console.log(validation_message);
						expect(validation_message).to.equal('\n\t\t\t\t\tUsername or Password is wrong.\n\t\t\t\t')
						done()

					})
					.catch(done)

			});

		});

		describe('/ (Login with Correct Email Address and Wrong Pasasword )', function() {

			it('should get validation error message when Password is wrong.', function(done) {

				nightmare
					.goto(url)
					.type('input[id="inputUsername"]', 'yogesh01@mailinator.com')
					.type('input[id="inputPassword"]', 'Yogesh123')
					.click('#signin')
					.evaluate(() => {

						return document.querySelector('#error_banner').innerText;

					})
					.end()
					.then((validation_message) => {

						console.log(validation_message);
						expect(validation_message).to.equal('\n\t\t\t\t\tUsername or Password is wrong.\n\t\t\t\t')
						done()

					})
					.catch(done)

			});

		});

		describe('/ (Login with correct credentials)', function() {

			it('should login with valid Email address and Password.', function(done) {

				nightmare
					.goto(url)
					.type('input[id="inputUsername"]', 'yogeshadvisor001@mailinator.com')
					.type('input[id="inputPassword"]', 'Yogesh@123')
					.click('#signin')
					.wait(15000)
					.evaluate(() => {

						return document.title;

					})
					.end()
					.then((title) => {

						console.log(title);
						expect(title).to.equal('Retireryte - Access - Remember')
						done()

					})
					.catch(done)

			});

		});

	});

	//
	//  It is Test Suite for Singup as Advisor
	//
	describe('Signup as Advisor', function () {

		describe('Check if email address is already exists in the system.', function() {

			it('should give validation message for email already exists.', function(done) {

				nightmare.goto(url)
					.click('body > main > form > div.text-center > div > p > a')
					.click('body > main > form > div.form-group > a:nth-child(1)')
					.type('input[id="first_name"]', 'Yogesh')
					.type('input[id="last_name"]', 'Kumar')
					.type('input[id="email"]', 'yogeshadvisor002@mailinator.com')
					.type('input[id="password"]', 'yogesh@123')
					.click('#certification')
					.click('body > main > form > div:nth-child(8) > button')
					.wait(10000)
					.evaluate(() => {

						return document.querySelector('#error_banner');

					})
					.end()
					.then((validation_message) => {

						//
						//	Check If Validation message is appearing. And if so
						//	stop the chain and log the issue.
						//
						if(validation_message)
						{
							//
							//	<>> Debug.
							//
							console.log('An account with the given email already exists.');

							//
							//	->	STOP and skip the rest to the check.
							//
							return done();
						}

						//
						//	<>> Debug
						//
						console.log('There is no validation error message coming.');

						//
						//	Get the title of the page if there is no
						//	Validation error message and check if User
						//	signed up as Advisor.
						//
						nightmare
							.refresh()
							.title()
							.end()
							.then(function(title){

								console.log(title);
								expect(title).to.equal('Retireryte - Access - Thank you');
								console.log('User is able to signup as Advisor if given email is not already exists.');

							});

						//
						//	->	Move to the next action.
						//
						done();

					})
					.catch(done)

			});

		});

		describe('given all correct data', function() {

			it('should singup as Advisor', function(done) {

				nightmare
					.goto(url)
					.click('body > main > form > div.text-center > div > p > a')
					.click('body > main > form > div.form-group > a:nth-child(1)')
					.type('input[id="first_name"]', 'Yogesh')
					.type('input[id="last_name"]', 'Kumar')
					.type('input[id="email"]', 'yogeshadvisor016@mailinator.com')
					.type('input[id="password"]', 'yogesh@123')
					.click('#certification')
					.click('body > main > form > div:nth-child(8) > button')
					.wait(10000)
					.evaluate(() => {

						return document.title;

					})
					.end()
					.then((title) => {

						console.log(title);
						expect(title).to.equal('Retireryte - Access - Thank you');
						done();

					})
					.catch(done)

			});

		});

	});

	//
	//  It is Test Suite for Singup as Investor
	//
	describe('Signup as Investor', function() {

		describe('check if email address is already exists.', function() {

			it('should give validation message for email already exists.', function(done) {

				nightmare.goto(url)
					.click('body > main > form > div.text-center > div > p > a')
					.click('body > main > form > div.form-group > a:nth-child(2)')
					.type('input[id="first_name"]', 'Yogesh')
					.type('input[id="last_name"]', 'Kumar')
					.type('input[id="email"]', 'yogeshinvestor002@mailinator.com')
					.type('input[id="password"]', 'yogesh@123')
					.click('.btn')
					.wait(10000)
					.evaluate(() => {

						return document.querySelector('#error_banner');

					})
					.end()
					.then((validation_message) => {

						//
						//	Check If Validation message is appearing. And if so
						//	stop the chain and log the issue.
						//
						if(validation_message)
						{
							//
							//	<>> Debug.
							//
							console.log('An account with the given email already exists.');

							//
							//	->	STOP and skip the rest to the check.
							//
							return done();
						}

						//
						//	<>> Debug
						//
						console.log('There is no validation error message coming.');

						//
						//	Get the title of the page if there is no
						//	Validation error message and check if User
						//	signed up as Advisor.
						//
						nightmare
							.refresh()
							.title()
							.end()
							.then(function(title){

								console.log(title);
								expect(title).to.equal('Retireryte - Access - Thank you');
								console.log('User is able to signup as Advisor if given email is not already exists.');

							});

						//
						//	->	Move to the next action.
						//
						done();

					})
					.catch(done)

			});

		});

		describe('given all correct data', function() {

			it('should singup as Investor', function(done) {

				nightmare
					.goto(url)
					.click('body > main > form > div.text-center > div > p > a')
					.click('body > main > form > div.form-group > a:nth-child(2)')
					.type('input[id="first_name"]', 'Yogesh')
					.type('input[id="last_name"]', 'Kumar')
					.type('input[id="email"]', 'yogeshinvestor016@mailinator.com')
					.type('input[id="password"]', 'yogesh@123')
					.click('.btn')
					.wait(10000)
					.evaluate(() => {

						return document.title;

					})
					.end()
					.then((title) => {

						console.log(title);
						expect(title).to.equal('Retireryte - Access - Thank you')
						done()

					})
					.catch(done)

			});

		});

	});

	//
	//  It is Test Suite for Password Reset
	//
	describe('Reset Password', function () {

		describe('Enter non-existing email address', function() {

			it('should give validation message i.e. "Email does not exists."', function(done) {

				nightmare
					.goto(url)
					.click('#reset')
					.type('input[id="email"]', 'yogesh@mailinator.com')
					.click('body > main > form > div:nth-child(4) > button')
					.wait(10000)
					.evaluate(() => {

						return document.querySelector('body > main > form > div:nth-child(2) > div').innerText;

					})
					.end()
					.then((validation_message) => {

						console.log(validation_message);
						expect(validation_message).to.equal('Email does not exists.')
						done()

					})
					.catch(done)

			});

		});

		describe('Enter valid email address and send password Reset link', function() {

			it('should send password reset link', function(done) {

				nightmare
					.goto(url)
					.click('#reset')
					.type('input[id="email"]', 'yogesh01@mailinator.com')
					.click('body > main > form > div:nth-child(4) > button')
					.wait(10000)
					.evaluate(() => {

						return document.title;

					})
					.end()
					.then((title) => {

						console.log(title);
						expect(title).to.equal('Retireryte - Access - Reset Password')
						done()

					})
					.catch(done)

			});

		});

	});

});
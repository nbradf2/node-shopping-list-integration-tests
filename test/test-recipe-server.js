const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// Use "should" style
const should = chai.should();

// Make HTTP requests
chai.use(chaiHttp);

describe('Recipes', function() {
	// activate server
	before(function() {
		return runServer();
	});

	after(function() {
		return closeServer();
	})

	// Test Strategy:
	// 1. make GET request to `/recipes`
	// 2. inspect response object and prove has right code and have
	// right keys in response object
	it('should list items on GET', function() {
		return chai.request(app)
			.get('/recipes')
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				// because we create three items on app load
				res.body.length.should.be.at.least(1);
				// each item should be object with key/value pairs
				// for 'id', 'name', 'ingredients'
				const expectedKeys = ['id', 'name', 'ingredients'];
				res.body.forEach(function(item) {
					item.should.be.a('object');
					item.should.include.keys(expectedKeys);
				});
			});
	});

	// Test Strategy:
	// 1. make POST request with data for a new item
	// 2. inspect response object and prove it has right
	// status code and taht the returned object has an 'id'
	it('should add an item on POST', function() {
		const newItem = {name: 'popcorn', ingredients: ['kernels', 'butter']};
		return chai.request(app)
			.post('/recipes')
			.send(newItem)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.should.be.a('object');
				res.body.should.include.keys('id', 'name', 'ingredients');
				res.body.id.should.not.be.null;
				// response should be deep equal to 'newItem' from above if
				// we assign 'id' to it from 'res.body.id'
				res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
			});
	});

	// Test Strategy:
	// 1. initialize some update data (we won't have an 'id' yet)
	// 2. make a GET request so we can get an item to update
	// 3. add the 'id' to 'updateData'
	// 4. make a PUT request with 'updateData'
	// 5. inspect the response object to ensure it
	// has the right status code and that we get back an updated
	// item with the right data in it.
	it('should update items on PUT', function() {
		// initialize updateData here and then after the initial
		// request to the app, we update it with an 'id' property so
		// we can make a second PUT call to the app.
		const updateData = {
			name: 'foo',
			ingredients: 'bar',
		};

		return chai.request(app)
		// first have to GET so we have an object to update
		.get('/recipes')
		.then(function(res) {
			updateData.id = res.body[0].id;
			// this will return a promise whose value will be the response
			// object, which we can inspect in the next 'then' back. 
			return chai.request(app)
				.put(`/recipes/${updateData.id}`)
				.send(updateData);
		})
		// prove that the PUT request has the right status code
		.then(function(res) {
			res.should.have.status(204);
		});
	});

	// Test Strategy:
	// 1. GET a shopping list item so we can get ID of one to delete
	// 2. DELETE an item and ensure we get back a status of 204
	it('should delete items on DELETE', function() {
		return chai.request(app)
		// first have to GET so we have 'id' of item to delete
		.get('/recipes')
		.then(function(res) {
			return chai.request(app)
				.delete(`/recipes/${res.body[0].id}`);
		})
		.then(function(res) {
			res.should.have.status(204);
		});
	});

});


























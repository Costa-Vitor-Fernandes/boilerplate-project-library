/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the its in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

describe("Functional Tests", function () {
  let bookId; // Variável para guardar o ID do livro entre os testes

  /*
   * ----[Antes de todos os testes, cria um livro para ser usado]----
   */
  before(function (done) {
    chai
      .request(server)
      .post("/api/books")
      .send({ title: "Test Book for Deletion and Comments" })
      .end(function (err, res) {
        assert.isNull(err);
        assert.equal(res.status, 200);
        bookId = res.body._id;
        done();
      });
  });

  /*
   * ----[Depois de todos os testes, apaga o livro criado]----
   * Nota: Este delete roda no final de tudo. O teste de delete no meio da suíte
   * vai apagar um livro criado dentro daquele próprio teste.
   */
  after(function (done) {
    if (!bookId) return done();
    chai
      .request(server)
      .delete("/api/books/" + bookId)
      .end(function (err, res) {
        done();
      });
  });

  describe("Routing tests", function () {
    describe("POST /api/books with title => create book object/expect book object", function () {
      it("Test POST /api/books with title", function (done) {
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Another Test Book" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response should be an object");
            assert.property(res.body, "title");
            assert.property(res.body, "_id");
            assert.equal(res.body.title, "Another Test Book");
            done();
          });
      });

      it("Test POST /api/books with no title given", function (done) {
        chai
          .request(server)
          .post("/api/books")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200); // O freeCodeCamp espera 200
            assert.equal(res.text, "missing required field title");
            done();
          });
      });
    });

    describe("GET /api/books => array of books", function () {
      it("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            if (res.body.length > 0) {
              const book = res.body[0];
              assert.property(book, "commentcount");
              assert.property(book, "title");
              assert.property(book, "_id");
            }
            done();
          });
      });
    });

    describe("GET /api/books/[id] => book object with [id]", function () {
      it("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get("/api/books/ffffffffffffffffffffffff") // ID com formato válido, mas inexistente
          .end(function (err, res) {
            assert.equal(res.status, 200); // O freeCodeCamp espera 200
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      it("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get("/api/books/" + bookId)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response should be an object");
            assert.property(res.body, "_id");
            assert.property(res.body, "title");
            assert.property(res.body, "comments");
            assert.isArray(res.body.comments);
            assert.equal(res.body._id, bookId);
            assert.equal(res.body.title, "Test Book for Deletion and Comments");
            done();
          });
      });
    });

    describe("POST /api/books/[id] => add comment/expect book object with id", function () {
      it("Test POST /api/books/[id] with comment", function (done) {
        chai
          .request(server)
          .post("/api/books/" + bookId)
          .send({ comment: "Test Comment" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response should be an object");
            assert.property(res.body, "comments");
            assert.isArray(res.body.comments);
            assert.include(res.body.comments, "Test Comment");
            assert.equal(res.body._id, bookId);
            done();
          });
      });

      it("Test POST /api/books/[id] without comment field", function (done) {
        chai
          .request(server)
          .post("/api/books/" + bookId)
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200); // O freeCodeCamp espera 200
            assert.equal(res.text, "missing required field comment");
            done();
          });
      });

      it("Test POST /api/books/[id] with comment, id not in db", function (done) {
        chai
          .request(server)
          .post("/api/books/ffffffffffffffffffffffff")
          .send({ comment: "Test" })
          .end(function (err, res) {
            assert.equal(res.status, 200); // O freeCodeCamp espera 200
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });

    describe("DELETE /api/books/[id] => delete book object id", function () {
      let tempBookId;
      before(function (done) {
        // Cria um livro temporário só para este teste de delete
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Book to be deleted" })
          .end(function (err, res) {
            tempBookId = res.body._id;
            done();
          });
      });

      it("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/" + tempBookId)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          });
      });

      it("Test DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/ffffffffffffffffffffffff")
          .end(function (err, res) {
            assert.equal(res.status, 200); // O freeCodeCamp espera 200
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });
  });
});

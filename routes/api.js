/*
 *
 *
 * Complete the API routing below
 *
 *
 */

"use strict";

module.exports = function (app) {
  const { MongoClient, ObjectId } = require("mongodb");
  require("dotenv").config();
  const client = new MongoClient(process.env.DB);
  let db;

  // Conectar ao banco de dados antes de iniciar o servidor (assumindo que a inicialização do app espera por isso)
  client
    .connect()
    .then(() => {
      db = client.db(); // O padrão é o nome do BD na sua string de conexão
      console.log("MongoDB connected");
    })
    .catch((err) => console.error("Connection error", err));

  app
    .route("/api/books")
    .get(async function (req, res) {
      try {
        const books = await db.collection("books").find({}).toArray();
        // O teste requer que a resposta para um GET geral inclua 'commentcount'
        const formattedBooks = books.map((book) => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments ? book.comments.length : 0,
        }));
        return res.json(formattedBooks);
      } catch (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
    })

    .post(async function (req, res) {
      const { title } = req.body;

      if (!title) {
        // O teste espera essa string exata.
        return res.send("missing required field title");
      }

      const newBook = {
        title: title,
        comments: [],
      };

      try {
        const result = await db.collection("books").insertOne(newBook);
        // O teste espera um objeto com o title e o _id do novo livro.
        return res.json({
          title: newBook.title,
          _id: result.insertedId,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
    })

    .delete(async function (req, res) {
      try {
        await db.collection("books").deleteMany({});
        // O teste espera essa resposta de sucesso.
        return res.send("complete delete successful");
      } catch (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
    });

  app
    .route("/api/books/:_id")
    .get(async function (req, res) {
      const bookid = req.params._id;

      // Validação do formato do ID
      if (!ObjectId.isValid(bookid)) {
        return res.send("no book exists");
      }

      try {
        const book = await db
          .collection("books")
          .findOne({ _id: new ObjectId(bookid) });

        if (!book) {
          // Se o livro não for encontrado, retorne a mensagem esperada pelo teste.
          return res.send("no book exists");
        }

        // Retorna o objeto do livro com o array de comentários.
        return res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments || [],
        });
      } catch (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
    })

    .post(async function (req, res) {
      const bookid = req.params._id;
      const { comment } = req.body;

      if (!comment) {
        // O teste espera esta mensagem se o comentário estiver ausente.
        return res.send("missing required field comment");
      }

      if (!ObjectId.isValid(bookid)) {
        return res.send("no book exists");
      }

      try {
        // 2. Encontrar o livro no banco de dados
        const book = await db
          .collection("books")
          .findOne({ _id: new ObjectId(bookid) });

        if (!book) {
          return res.send("no book exists");
        }

        // 3. Adicionar o novo comentário ao array de comentários do livro
        book.comments.push(comment);

        // 4. Salvar o documento inteiro do livro de volta no banco de dados
        const result = await db
          .collection("books")
          .updateOne(
            { _id: new ObjectId(bookid) },
            { $set: { comments: book.comments } },
          );

        // 5. Retornar o livro atualizado
        // O objeto 'book' aqui já contém o comentário novo
        res.json(book);
      } catch (e) {
        res.status(500).send("database error");
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params._id;

      if (!ObjectId.isValid(bookid)) {
        return res.send("no book exists");
      }

      try {
        const deleteResult = await db
          .collection("books")
          .deleteOne({ _id: new ObjectId(bookid) });

        // Se nada foi deletado, o livro não existia.
        if (deleteResult.deletedCount === 0) {
          return res.send("no book exists");
        }

        // Resposta de sucesso esperada pelo teste.
        return res.send("delete successful");
      } catch (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
    });
};

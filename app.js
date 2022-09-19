import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

app.use(cors());
app.use(express.json());

const port = 4001;
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "notice",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/boards", async (req, res) => {
  const [row] = await pool.query("SELECT * FROM board ORDER BY id DESC");
  res.json(row);
});

app.get("/boards/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, perform_date } = req.body;
  const [rows] = await pool.query(
    `
  SELECT id, title, content, perform_date FROM board
  WHERE id = ?
  `,
    [id, title, content, perform_date]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "NOT FOUND",
    });
    return;
  }
  res.json(rows[0]);
  // console.log(id);
});

app.post("/boards/insert", async (req, res) => {
  const {
    body: { title, content },
  } = req;

  await pool.query(
    `INSERT INTO board
    SET perform_date = NOW(),
    title = ?,
    content = ?`,
    [title, content]
  );

  res.send("success!!");

  // const [[addPost]] = await pool.query(
  //   `
  //   SELECT * FROM board
  //   ORDER BY id DESC
  //   `
  // );
  // res.json(addPost);
});

app.delete("/boards/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRows]] = await pool.query(
    `
    SELECT * FROM board
    WHERE id = ?
    `,
    [id]
  );

  if (todoRows === undefined) {
    res.status(404).json({
      msg: "not found",
    });
  }

  const [rs] = await pool.query(
    `
    DELETE FROM board
    WHERE id = ?
`,
    [id]
  );
  res.json();
});

app.patch("/boards/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const [rows] = await pool.query(
    `
    SELECT * FROM board
    WHERE id = ?
    `,
    [id]
  );
  if (rows.length === 0) {
    res.status(404).json({
      msg: "Not Found",
    });
  }

  if (!title) {
    res.status(404).json({
      msg: "title required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE board
    SET title = ?, content = ?
    WHERE id = ?
    `,
    [title, content, id]
  );

  res.json({
    msg: `${id}번 게시글이 수정되었습니다.`,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

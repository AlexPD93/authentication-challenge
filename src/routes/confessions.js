const {
  listConfessions,
  createConfession,
} = require("../model/confessions.js");
const { getSession } = require("../model/session.js");
const { Layout } = require("../templates.js");

function get(req, res) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  //What does session && session.user_id do?
  const currentUser = session && session.user_id;
  const pageOwner = Number(req.params.user_id);
  if (currentUser !== pageOwner) {
    return res.status(401).send("<h1>You aren't allowed to see that</h1>");
  } else {
    const confessions = listConfessions(req.params.user_id);
    const title = "Your secrets";
    const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Stack" style="--gap: 0.5rem">
        <textarea name="content" aria-label="your confession" rows="4" cols="30" style="resize: vertical"></textarea>
        <button class="Button">Confess 🤫</button>
      </form>
      <ul class="Center Stack">
        ${confessions
          .map(
            (entry) => `
            <li>
              <h2>${entry.created_at}</h2>
              <p>${entry.content}</p>
            </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
    const body = Layout({ title, content });
    res.send(body);
  }
}

function post(req, res) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);

  const currentUser = session && session.user_id;
  if (!req.body.content || !currentUser) {
    return res.status(401).send("<h1>You aren't not logged in!</h1>");
  }
  createConfession(req.body.content, currentUser);
  res.redirect(`/confessions/${currentUser}`);
}

module.exports = { get, post };

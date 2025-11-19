const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return req.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.Account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const { isPremium } = req.body;

  if (!username || !pass || !pass2) {
    return req.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return req.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash, isPremium });
    await newAccount.save();
    req.session.Account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already taken!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const changePassword = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  console.log('changing password');

  if (!username || !pass || !pass2) {
    return req.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return req.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const query = { username };
    await Account.findOneAndUpdate(query, { password: hash });
    return res.json({ redirect: '/login' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error ocurred, please try again!' });
  }
};

module.exports = {
  loginPage,
  logout,
  login,
  signup,
  changePassword,
};

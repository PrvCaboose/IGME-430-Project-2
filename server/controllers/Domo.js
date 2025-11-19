const models = require('../models');

const { Domo } = models;

const makerPage = (req, res) => res.render('app');

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.Account._id };
    const docs = await Domo.find(query).select('name age').lean().exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos' });
  }
};

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'Both name and age are required!' });
  }
  // If account isn't premium, check if they hit the max domos
  if (!req.session.Account.isPremium) {
    try {
      const query = { owner: req.session.Account._id };
      const docs = await Domo.find(query).select('name age').lean().exec();

      if (docs.length === 10) {
        return res.status(400).json({ error: 'Max Domos made!' });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error retrieving domos' });
    }
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    owner: req.session.Account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making a Domo!' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
};

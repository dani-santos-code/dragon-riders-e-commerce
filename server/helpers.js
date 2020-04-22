const companyData = require("./data/companies.json");

const MAX_DELAY = 1000;
const FAILURE_ODDS = 0.05;

const simulateProblems = (res, data) => {
  const delay = Math.random() * MAX_DELAY;

  setTimeout(() => {
    const shouldError = Math.random() <= FAILURE_ODDS;

    if (shouldError) {
      res.sendStatus(500);
      return;
    }

    res.json(data);
  }, delay);
};

module.exports = { simulateProblems };

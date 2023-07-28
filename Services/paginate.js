const paginate = (results, page, perPage) => {
  const offSet = (page - 1) * perPage;
  const paginateRes = results.slice(offSet, offSet + perPage);
  return paginateRes;
};

module.exports = paginate;

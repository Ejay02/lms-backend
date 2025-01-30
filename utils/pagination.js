const paginateResults = async (
  model,
  query = {},
  page = 1,
  limit = 10,
  populate = ""
) => {
  const skip = (page - 1) * limit;

  const results = await model
    .find(query)
    .populate(populate)
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await model.countDocuments(query);

  return {
    data: results,
    pagination: {
      current: page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: skip + results.length < total,
      hasPrev: page > 1,
    },
  };
};

module.exports = paginateResults;

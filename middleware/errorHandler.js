const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(400).json({
      error: "Duplicate Error",
      message: "This record already exists",
    });
  }

  res.status(500).json({
    error: "Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred",
  });
};

module.exports = errorHandler;

// utils/pagination.js
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

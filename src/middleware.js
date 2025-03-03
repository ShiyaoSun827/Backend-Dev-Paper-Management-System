// Request logger middleware
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// Validate paper input
const validatePaper = (paper) => {
  // TODO: Implement paper validation
  // Return an array of error messages, empty array if validation passes
  //
  // Required fields validation:
  // - title: non-empty string
  // - authors: non-empty string
  // - published_in: non-empty string
  // - year: integer greater than 1900
  //
  // Error message format should match the handout, for example:
  // - "Title is required"
  // - "Authors are required"
  // - "Published venue is required"
  // - "Published year is required"
  // - "Valid year after 1900 is required"
  const errors = [];
  if (!paper.title || typeof paper.title !== "string" || paper.title.trim() === "") {
    errors.push("Title is required");
  }

  if (!paper.authors || typeof paper.authors !== "string" || paper.authors.trim() === "") {
    errors.push("Authors are required");
  }

  if (!paper.published_in || typeof paper.published_in !== "string" || paper.published_in.trim() === "") {
    errors.push("Published venue is required");
  }

  if (paper.year === undefined || paper.year === null) {
    errors.push("Published year is required");
  } else if (typeof paper.year !== "number" || paper.year <= 1900) {
    errors.push("Valid year after 1900 is required");
  }

  return errors;
  

  
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // TODO: Implement error handling
  // Hint: Return errors in these exact formats as specified in the handout:
  //
  // 1. Validation Errors (400):
  // {
  //   "error": "Validation Error",
  //   "messages": ["Title is required", "Valid year after 1900 is required"]
  // }
  //
  // 2. Not Found Error (404):
  // {
  //   "error": "Paper not found"
  // }
  //
  // 3. Invalid Query Parameter (400):
  // {
  //   "error": "Validation Error",
  //   "message": "Invalid query parameter format"
  // }
  //
  // Remember to:
  // - Log errors for debugging (console.error)
  // - Send appropriate status codes (400, 404)
  console.error(err);
  if (err.status === 400) {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message || "Invalid request" 
    });
  }

  
  if (err.status === 404) {
    return res.status(404).json({
      error: "Paper not found"
    });
  }

};

// Validate ID parameter middleware
const validateId = (req, res, next) => {
  // TODO: Implement ID validation
  //
  // If ID is invalid, return:
  // Status: 400
  // {
  //   "error": "Validation Error",
  //   "message": "Invalid ID format"
  // }
  //
  // If valid, call next()
  const id = req.params.id || req.query.id;
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) {
    return next({
      status: 400,
      message: "Invalid ID format" 
    });
  }

  next();


};
//check year,limit,offset
const validateyearlimitoffest = (req, res, next) => {
  const errors = [];
  const { year, limit, offset } = req.query;

  // Validate year: must be a valid integer greater than 1900
  if (year !== undefined && year !== "") {
    if (!/^\d+$/.test(year)) {
      errors.push("Invalid query parameter format");
    } else {
      const parsedYear = parseInt(year, 10);
      if (parsedYear <= 1900) {
        errors.push("Invalid query parameter format");
      }
    }
  }

  // Validate limit: must be a positive integer between 1-100
  if (limit !== undefined && limit !== "") {
    if (!/^\d+$/.test(limit)) {
      errors.push("Invalid query parameter format");
    } else {
      const parsedLimit = parseInt(limit, 10);
      if (parsedLimit <= 0 || parsedLimit > 100) {
        errors.push("Invalid query parameter format");
      }
    }
  }

  // Validate offset: must be a non-negative integer
  if (offset !== undefined && offset !== "") {
    if (!/^\d+$/.test(offset)) {
      errors.push("Invalid query parameter format");
    } else {
      const parsedOffset = parseInt(offset, 10);
      if (parsedOffset < 0) {
        errors.push("Invalid query parameter format");
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format"
    });
  }

  next();
};
module.exports = {
  requestLogger,
  validatePaper,
  errorHandler,
  validateId,
  validateyearlimitoffest,
};

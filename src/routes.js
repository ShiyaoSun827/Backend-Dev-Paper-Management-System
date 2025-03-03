const express = require("express");
const router = express.Router();
const {db} = require("./database");
const { validatePaper } = require("./middleware");
const { validateId } = require("./middleware");
const { errorHandler } = require("./middleware");
const { validateyearlimitoffest } = require("./middleware");
const getCurrentTimestamp = () => new Date().toISOString();
const { createPaper } = require("./database");
const { getAllPapers } = require("./database");
const { getPaperById } = require("./database");
const { updatePaper } = require("./database"); 
const { deletePaper } = require("./database");
// GET /api/papers
router.get("/papers",validateyearlimitoffest, async (req, res, next) => {
  try {
    
    //const errors = validateId(req);
    //if (errors.length > 0) {
      //return res.status(400).json({
        //error: "Validation Error",
        //messages: errors
      //});
    //}
    const filters = {
      year: req.query.year ? parseInt(req.query.year) : null,
      published_in: req.query.published_in,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    // Your implementation here
    const papers = await getAllPapers(filters);
    //handle paper not found
    if (papers.length === 0) {
      return next({ status: 404 });
    }
    
    res.status(200).json(papers);
  } catch (error) {
    next(error);
  }
});

// GET /api/papers/:id
router.get("/papers/:id",validateId, async (req, res, next) => {
  try {
    // Your implementation here
    const paperId = parseInt(req.params.id, 10);
    const paper = await getPaperById(paperId);
    if (!paper) {
      return next({ status: 404 });
    }
    
    res.status(200).json(paper);
  } catch (error) {
    next(error);
  }
});

// POST /api/papers
router.post("/papers", async (req, res, next) => {
  try {
    const errors = validatePaper(req.body);
    
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", messages: errors });
    }

    // Your implementation here
    const newPaper = await createPaper(req.body);

  
    res.status(201).json(newPaper);
  } catch (error) {
    
    next(error);
  }
});

// PUT /api/papers/:id
router.put("/papers/:id",validateId, async (req, res, next) => {
  try {
    const errors = validatePaper(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", messages: errors });
    }

    // Your implementation here
    const paperId = parseInt(req.params.id, 10);

   
    const updatedPaper = await updatePaper(paperId, req.body);

 
    if (!updatedPaper) {
      return next({ status: 404 });
    }


    res.status(200).json(updatedPaper);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/papers/:id
router.delete("/papers/:id",validateId, async (req, res, next) => {
  try {
    // Your implementation here
    const paperId = parseInt(req.params.id, 10);
    const deleted = await deletePaper(paperId);

   
    if (!deleted) {
      return next({ status: 404 });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
router.use(errorHandler);
module.exports = router;

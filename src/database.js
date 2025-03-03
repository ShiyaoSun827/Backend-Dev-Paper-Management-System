const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./paper_management.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// TODO: Create a table named papers with the schema specified in the handout
db.run(`
  CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    published_in TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year > 1900),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error("Error creating papers table:", err);
  } else {
    console.log("Papers table is ready");
  }
});
// TODO: Implement these database operations
const dbOperations = {
  createPaper: async (paper) => {
    // Your implementation here
    // Hint: You need to:
    // 1. Create and execute an INSERT SQL statement
    // 2. Use await to handle the promise
    // 3. Return the created paper with its ID
    // Example structure:
    // try {
    //   const result = await new Promise((resolve, reject) => {
    //     db.run(
    //       "INSERT INTO ... VALUES ...",
    //       [...values],
    //       function(err) {
    //         if (err) reject(err);
    //         else resolve(this.lastID);
    //       }
    //     );
    //   });
    //   return { id: result, ...paper };
    // } catch (error) {
    //   throw error;
    // }
    try {
      const { title, authors, published_in, year } = paper;
      const timestamp = new Date().toISOString(); 

      const result = await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO papers (title, authors, published_in, year, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [title, authors, published_in, year, timestamp, timestamp], function (err) {
          if (err) reject(err);
          else resolve({
            id: this.lastID,
            title,
            authors,
            published_in,
            year,
            created_at: timestamp,
            updated_at: timestamp,
          });
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  getAllPapers: async (filters = {}) => {
    // Your implementation here
    // Remember to handle filters (year, published_in)
    // Hint:
    // 1. Start with a basic SELECT query
    // 2. Add WHERE clauses based on filters:
    //    - If filters.year exists, add "year = ?"
    //    - If filters.published_in exists, add "published_in LIKE ?"
    // 3. Use an array to store query parameters
    // Example structure:
    // let query = "SELECT * FROM papers";
    // const params = [];
    // if (filters.year) {
    //   query += " WHERE year = ?";
    //   params.push(filters.year);
    // }
    // ...
    // const result = await new Promise((resolve, reject) => {
    //   db.all(query, params, (err, rows) => {
    //     if (err) reject(err);
    //     else resolve(rows);
    //   });
    // });
    try {
      let query = `
        SELECT 
          id, 
          title, 
          authors, 
          published_in, 
          year, 
          CAST(created_at AS TEXT) AS created_at, 
          CAST(updated_at AS TEXT) AS updated_at 
        FROM papers
      `;
      const queryParams = [];
      const conditions = [];
  
      if (filters.year) {
        conditions.push("year = ?");
        queryParams.push(filters.year);
      }
      if (filters.published_in) {
        conditions.push("published_in LIKE ?");
        queryParams.push(`%${filters.published_in}%`);
      }
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      query += " LIMIT ? OFFSET ?";
      queryParams.push(filters.limit || 10, filters.offset || 0);
  
      const result = await new Promise((resolve, reject) => {
        db.all(query, queryParams, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
  
      return result;
    } catch (error) {
      throw error;
    }
  },

  getPaperById: async (id) => {
    // Your implementation here
    // Hint: Use await with a new Promise that wraps the db.get() operation
    try {
      const result = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            id, 
            title, 
            authors, 
            published_in, 
            year, 
            CAST(created_at AS TEXT) AS created_at, 
            CAST(updated_at AS TEXT) AS updated_at 
          FROM papers 
          WHERE id = ?
        `;
        db.get(query, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  updatePaper: async (id, paper) => {
    // Your implementation here
    try {
      const { title, authors, published_in, year } = paper;
      const updatedTimestamp = new Date().toISOString(); 

    
      const existingPaper = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM papers WHERE id = ?", [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existingPaper) {
        return null; 
      }

      
      await new Promise((resolve, reject) => {
        const query = `
          UPDATE papers
          SET title = ?, authors = ?, published_in = ?, year = ?, updated_at = ?
          WHERE id = ?
        `;
        db.run(query, [title, authors, published_in, year, updatedTimestamp, id], function (err) {
          if (err) reject(err);
          else resolve();
        });
      });

      return {
        id,
        title,
        authors,
        published_in,
        year,
        created_at: existingPaper.created_at, 
        updated_at: updatedTimestamp 
      };
    } catch (error) {
      throw error;
    }
  },

  deletePaper: async (id) => {
    // Your implementation here
    try {
      
      const existingPaper = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM papers WHERE id = ?", [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existingPaper) {
        return null; 
      }

     
      await new Promise((resolve, reject) => {
        db.run("DELETE FROM papers WHERE id = ?", [id], function (err) {
          if (err) reject(err);
          else resolve();
        });
      });

      return true; 
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  db, // export the database instance
  ...dbOperations, // spreads all operations as individual exports
};

const request = require("supertest");
const app = require("../src/server");
const { db } = require("../src/database");

const samplePaper = {
  title: "Sample Paper Title",
  authors: "John Doe, Jane Smith",
  published_in: "ICSE 2024",
  year: 2024,
};

// Clean up before all tests
beforeAll(async () => {
  await new Promise((resolve, reject) => {
    db.run("DELETE FROM papers", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

// Clean up after all tests
afterAll(async () => {
  await new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

describe("Paper Management API Tests", () => {
  let paperId;

  // POST /api/papers
  describe("POST /api/papers", () => {
    it("should create a new paper with valid input", async () => {
      const res = await request(app).post("/api/papers").send(samplePaper);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(samplePaper);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("created_at");
      expect(res.body).toHaveProperty("updated_at");

      paperId = res.body.id;
    });
    it("should create another paper with valid input", async () => {
      const newPaper = {
        title: "Another Sample Paper Title",
        authors: "Alice Johnson, Bob Brown",
        published_in: "ICSE 2025",
        year: 2025,
      };
      const res = await request(app).post("/api/papers").send(newPaper);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(newPaper);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("created_at");
      expect(res.body).toHaveProperty("updated_at");
    });

    it("should create a third paper with valid input", async () => {
      const anotherPaper = {
        title: "Third Sample Paper Title",
        authors: "Charlie Green, Dana White",
        published_in: "ICSE 2026",
        year: 2026,
      };
      const res = await request(app).post("/api/papers").send(anotherPaper);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(anotherPaper);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("created_at");
      expect(res.body).toHaveProperty("updated_at");
    });
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/papers").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Title is required",
        "Authors are required",
        "Published venue is required",
        "Published year is required",
      ]);
    });

    it("should return 400 if year is invalid", async () => {
      const res = await request(app).post("/api/papers").send({
        ...samplePaper,
        year: 1900,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
    });

    it("should return 400 if authors and year are missing", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "Valid Title",
        published_in: "ICSE 2024",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Authors are required",
        "Published year is required",
      ]);
    });

    it("should return 400 if authors are missing and year is invalid", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "Valid Title",
        published_in: "ICSE 2024",
        year: 1900, // Invalid year
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Authors are required",
        "Valid year after 1900 is required",
      ]);
    });

    it("should handle unexpected fields gracefully", async () => {
      const res = await request(app).post("/api/papers").send({
        ...samplePaper,
        extraField: "random",
      });

      expect(res.status).toBe(201);
      expect(res.body).not.toHaveProperty("extraField");
    });

    it("should return 400 for invalid data types in POST", async () => {
      const res = await request(app).post("/api/papers").send({
        title: 123, // Should be a string
        authors: ["John Doe", "Jane Smith"], // Should be a string
        published_in: true, // Should be a string
        year: "twenty twenty-four", // Should be an integer
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Title is required",
        "Authors are required",
        "Published venue is required",
        "Valid year after 1900 is required",
      ]);
    });

    it("should return 400 if title is an empty string", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "",
        authors: "John Doe",
        published_in: "ICSE 2024",
        year: 2024,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Title is required"]);
    });

    it("should return 400 if authors are a string with only spaces", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "Valid Title",
        authors: "   ",
        published_in: "ICSE 2024",
        year: 2024,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Authors are required"]);
    });

    it("should return 400 if published_in is an empty string", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "Valid Title",
        authors: "John Doe",
        published_in: "",
        year: 2024,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Published venue is required"]);
    });

    it("should return 400 if year is a negative integer", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "Valid Title",
        authors: "John Doe",
        published_in: "ICSE 2024",
        year: -2024,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
    });

    it("should return 400 if year is a decimal number", async () => {
      const res = await request(app).post("/api/papers").send({
        title: "Valid Title",
        authors: "John Doe",
        published_in: "ICSE 2024",
        year: 1.23,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
    });
  });

  it("should return 400 if year is a string", async () => {
    const res = await request(app).post("/api/papers").send({
      title: "Valid Title",
      authors: "John Doe",
      published_in: "ICSE 2024",
      year: "2024", // Year as a string
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation Error");
    expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
  });

  it("should return 400 if year is null", async () => {
    const res = await request(app).post("/api/papers").send({
      title: "Valid Title",
      authors: "John Doe",
      published_in: "ICSE 2024",
      year: null,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation Error");
    expect(res.body.messages).toEqual(["Published year is required"]);
  });

  // GET /api/papers
  describe("GET /api/papers", () => {
    it("should retrieve a list of papers", async () => {
      const res = await request(app).get("/api/papers");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should apply filters correctly", async () => {
      const res = await request(app).get(
        `/api/papers?year=${samplePaper.year}&published_in=ICSE`
      );

      expect(res.status).toBe(200);
      res.body.forEach((paper) => {
        expect(paper.year).toBe(samplePaper.year);
        expect(paper.published_in).toMatch(/ICSE/i);
      });
    });

    it("should handle pagination correctly", async () => {
      const res = await request(app).get("/api/papers?limit=2&offset=1");

      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(2);
    });

    it("should return 400 for invalid query parameter 'year' when less then 1900", async () => {
      const res = await request(app).get("/api/papers?year=1800");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    // New Query Parameter Validation Test Cases

    it("should return 400 for invalid query parameter 'year' when non-numeric", async () => {
      const res = await request(app).get("/api/papers?year=abc");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'year' when non-numeric", async () => {
      const res = await request(app).get("/api/papers?year=2019-2024");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'year' when less than or equal to 1900", async () => {
      const res = await request(app).get("/api/papers?year=1900");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });
    it("should return 400 for invalid query parameter 'year' when decimal", async () => {
      const res = await request(app).get("/api/papers?year=2023.5");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });
    it("should return 400 for invalid query parameter 'limit' when negative", async () => {
      const res = await request(app).get("/api/papers?limit=-5");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'limit' when float", async () => {
      const res = await request(app).get("/api/papers?limit=5.5");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'limit' when not a number", async () => {
      const res = await request(app).get("/api/papers?limit=abc");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'limit' when not valid", async () => {
      const res = await request(app).get("/api/papers?limit=15-20");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'limit' when zero", async () => {
      const res = await request(app).get("/api/papers?limit=0");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'limit' when greater than 100", async () => {
      const res = await request(app).get("/api/papers?limit=101");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'offset' when negative", async () => {
      const res = await request(app).get("/api/papers?offset=-1");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'offset' when float", async () => {
      const res = await request(app).get("/api/papers?offset=2.5");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'offset' when not a number", async () => {
      const res = await request(app).get("/api/papers?offset=abc");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'offset' when not valid", async () => {
      const res = await request(app).get("/api/papers?offset=15-20");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });

    it("should return 400 for invalid query parameter 'year' when year is a float", async () => {
      const res = await request(app).get("/api/papers?year=2024.5");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid query parameter format");
    });
  });

  // GET /api/papers/:id
  describe("GET /api/papers/:id", () => {
    it("should return 400 for invalid ID formats", async () => {
      const res = await request(app).get("/api/papers/abc");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("should return 400 for invalid ID formats", async () => {
      const res = await request(app).get("/api/papers/15-20");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("should return 400 for invalid ID formats", async () => {
      const res = await request(app).get("/api/papers/5.5");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("should return 404 if the paper ID does not exist", async () => {
      const res = await request(app).get("/api/papers/99999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });
  });

  // PUT /api/papers/:id
  describe("PUT /api/papers/:id", () => {
    it("should update an existing paper when all required fields are provided", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const updatedPaper = {
        title: "Updated Title",
        authors: "Updated Author",
        published_in: "Updated Venue",
        year: 2025,
      };

      const res = await request(app)
        .put(`/api/papers/${createRes.body.id}`)
        .send(updatedPaper);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updatedPaper);
      expect(res.body).toHaveProperty("updated_at");
      expect(res.body).toHaveProperty("created_at");

      // Ensure created_at remains the same
      expect(res.body.created_at).toBe(createRes.body.created_at);
      expect(res.body.year).not.toBe(createRes.body.year);
      expect(res.body.title).not.toBe(createRes.body.title);
      expect(res.body.published_in).not.toBe(createRes.body.published_in);

    });

    it("should return 400 if any required field is missing", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);

      const invalidPayloads = [
        { authors: "Updated Author", published_in: "Updated Venue", year: 2025 }, // Missing title
        { title: "Updated Title", published_in: "Updated Venue", year: 2025 }, // Missing authors
        { title: "Updated Title", authors: "Updated Author", year: 2025 }, // Missing published_in
        { title: "Updated Title", authors: "Updated Author", published_in: "Updated Venue" }, // Missing year
      ];

      for (const payload of invalidPayloads) {
        const res = await request(app)
          .put(`/api/papers/${createRes.body.id}`)
          .send(payload);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      }
    });

    it("should return 400 if year is invalid (not an integer > 1900)", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const res = await request(app)
        .put(`/api/papers/${createRes.body.id}`)
        .send({
          title: "Updated Title",
          authors: "Updated Author",
          published_in: "Updated Venue",
          year: "invalid-year",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
    });

    it("should return 400 if request body is empty", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const res = await request(app).put(`/api/papers/${createRes.body.id}`).send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Title is required",
        "Authors are required",
        "Published venue is required",
        "Published year is required",
      ]);
    });

    it("should return 404 if paper is not found", async () => {
      const res = await request(app)
        .put("/api/papers/99999")
        .send(samplePaper);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });

    it("should return 400 if ID format is invalid", async () => {
      const res = await request(app).put("/api/papers/abc").send(samplePaper);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("should return 400 if ID format is invalid", async () => {
      const res = await request(app).put("/api/papers/15-20").send(samplePaper);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid ID format");
    });

    // Additional validation for data types in PUT
    it("should return 400 for invalid data types in PUT", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const res = await request(app)
        .put(`/api/papers/${createRes.body.id}`)
        .send({
          title: 456, // Should be a string
          authors: { name: "Author" }, // Should be a string
          published_in: 789, // Should be a string
          year: "not-a-number", // Should be an integer
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Title is required",
        "Authors are required",
        "Published venue is required",
        "Valid year after 1900 is required",
      ]);
    });

    it("should return 400 if trying to update with an invalid year (string)", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const res = await request(app)
        .put(`/api/papers/${createRes.body.id}`)
        .send({
          title: "Updated Title",
          authors: "Updated Author",
          published_in: "Updated Venue",
          year: "not-a-number",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
    });

    it("should return 404 if trying to update a non-existent paper", async () => {
      const res = await request(app)
        .put("/api/papers/99999")
        .send(samplePaper);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });
  });

  // DELETE /api/papers/:id
  describe("DELETE /api/papers/:id", () => {
    it("should return 400 for invalid ID formats", async () => {
      const res = await request(app).delete("/api/papers/abc");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("should return 404 when trying to delete the same paper twice", async () => {
      const res1 = await request(app).delete(`/api/papers/${paperId}`);
      expect(res1.status).toBe(204);
      expect(res1.body).toEqual({});

      const res = await request(app).delete(`/api/papers/${paperId}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });

    it("should return 404 if trying to delete a non-existent paper", async () => {
      const res = await request(app).delete("/api/papers/99999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });
  });

  describe("Timestamp Format Tests", () => {
    it("should return ISO 8601 formatted timestamps on GET /api/papers/:id", async () => {
      // First, create a paper
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const paperId = createRes.body.id;

      const res = await request(app).get(`/api/papers/${paperId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("created_at");
      expect(res.body).toHaveProperty("updated_at");

      // Alternatively, you can also use Date conversion:
      const createdAt = new Date(res.body.created_at).toISOString();
      const updatedAt = new Date(res.body.updated_at).toISOString();
      expect(createdAt).toBe(res.body.created_at);
      expect(updatedAt).toBe(res.body.updated_at);
    });


    it("should return ISO 8601 formatted timestamps on POST /api/papers", async () => {
      const res = await request(app).post("/api/papers").send(samplePaper);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("created_at");
      expect(res.body).toHaveProperty("updated_at");

      // Alternatively, you can also use Date conversion:
      const createdAt = new Date(res.body.created_at).toISOString();
      const updatedAt = new Date(res.body.updated_at).toISOString();
      expect(createdAt).toBe(res.body.created_at);
      expect(updatedAt).toBe(res.body.updated_at);
    });

    it("should return ISO 8601 formatted timestamps on PUT /api/papers/:id", async () => {
      // First, create a paper
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const paperId = createRes.body.id;

      // Update the paper
      const updatedPaper = {
        title: "Updated Title",
        authors: "Updated Author",
        published_in: "Updated Venue",
        year: 2025,
      };
      const updateRes = await request(app).put(`/api/papers/${paperId}`).send(updatedPaper);

      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toHaveProperty("created_at");
      expect(updateRes.body).toHaveProperty("updated_at");

      // Alternatively, using Date conversion:
      const createdAt = new Date(updateRes.body.created_at).toISOString();
      const updatedAt = new Date(updateRes.body.updated_at).toISOString();
      expect(createdAt).toBe(updateRes.body.created_at);
      expect(updatedAt).toBe(updateRes.body.updated_at);
    });
  });
});

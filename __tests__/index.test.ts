const request = require("supertest");
const path = require("path");

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

// // const mockImage = require("../__mocks__/image_mock");

// // jest.mock('multer');

// jest.setTimeout(20000)

// describe("API Tests", () => {
//     let imageBuffer;

//     beforeAll(async () => {
//         imageBuffer = await mockImage(2000, 2000, 'blue');
//     });

//     afterAll((done) => {
//         server.close(done);
//     });

//     describe("Test endpoints with ping", () => {
//         test("all iocs", async () => {
//             const res = await request(app).get("/api/iocs");
//             expect(res.status).toBe(200);
//         });

//         test("all hosts", async () => {
//             const res = await request(app).get("/api/hosts");
//             expect(res.status).toBe(200);
//         });

//         test("all forms", async () => {
//             const res = await request(app).get("/api/forms");
//             expect(res.status).toBe(200);
//         });

//         // test("price fetch", async () => {
//         //     const res = await request(app).get("/api/price/?q=BTC");
//         //     expect(res.status).toBe(200);
//         // });

//         test("octokit rate limit", async () => {
//             const res = await request(app).get("/octokit");
//             expect(res.status).toBe(200);
//         });
//     });

//     describe("Image Upload", () => {
//         test('should upload image successfully', async () => {
//             const res = await request(app)
//                 .post('/api/upload_file')
//                 .attach('evidence', imageBuffer, 'test-image.png');

//             expect(res.status).toBe(201);
//         });
//     });
// });

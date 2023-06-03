const p1 = new Promise((resolve, reject) => {
  resolve(1);
});

const p2 = (params) => {
  return new Promise((resolve, reject) => {
    resolve(params);
  });
};

p1.then((result) => {
  console.log("🚀 ~ file: test.js:10 ~ p1.then ~ result:", result);
  return p2(result);
})
  .then((result) => {
    console.log("🚀 ~ file: test.js:13 ~ p1.then ~ result:", result);
  })
  .catch((error) => {
    console.log("🚀 ~ file: test.js:15 ~ p1.then ~ error:", error);
  });

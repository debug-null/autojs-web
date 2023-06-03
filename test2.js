
var downPath2 = files.join(files.getSdcardPath(), "Download", "hotel-qr2.text");
console.log("🚀 ~ file: test2.js:4 ~ downPath:", downPath2)

// app.startActivity({
//     action: "android.intent.action.VIEW",
//     type: "image/*",
//     data: "file://" + downPath2
//   });


files.write(downPath2, 'sdsdd');


app.viewFile(downPath2);

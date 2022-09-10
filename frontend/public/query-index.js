/**
 * This hooks together all the CampusExplorer methods and binds them to clicks on the submit button in the UI.
 *
 * The sequence is as follows:
 * 1.) Click on submit button in the reference UI
 * 2.) Query object is extracted from UI using global document object (CampusExplorer.buildQuery)
 * 3.) Query object is sent to the POST /query endpoint using global XMLHttpRequest object (CampusExplorer.sendQuery)
 * 4.) Result is rendered in the reference UI by calling CampusExplorer.renderResult with the response from the endpoint as argument
 */

// simple implementation to get the front-end running for testing
const clickMe = document.getElementById("submit-button");
clickMe.addEventListener("click", () => {
    const query = CampusExplorer.buildQuery();
    CampusExplorer.sendQuery(query).then((r) => {
        const rstring = r.toString();
        const objR = JSON.parse(rstring);
        CampusExplorer.renderResult(objR);
    }).catch((err) => {
        // Error case (Incorrect query)
        CampusExplorer.renderResult(err);
    });
}, false);


// OLD:
// // have event listener for submit button click
// var submit = document.getElementById("#submit-button");
// submit.addEventListener("click", function() {
//     // send written query into query-builder.js function, get back proper json query
//    let query = CampusExplorer.buildQuery();
//     // send query to POST (query-sender.js), returns a promise if fulfilled if AJAZ successful
//    CampusExplorer.sendQuery(query).then(() => {
//        // do stuff?
//    }).catch(() => { Promise.reject("unresolved")} );
// });

// let submit = document.getElementById("#submit-button");
// if (submit) {
//     submit.addEventListener("click", function() {
//         // send written query into query-builder.js function, get back proper json query
//         let query = CampusExplorer.buildQuery();
//         // send query to POST (query-sender.js), returns a promise if fulfilled if AJAZ successful
//         /*CampusExplorer.sendQuery(query).then(() => {
//             // do stuff?
//         }).catch(() => { Promise.reject("unresolved")} );*/
//     });
// }

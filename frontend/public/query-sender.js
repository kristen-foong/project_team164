/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 * Query object is sent to the POST /query endpoint using global XMLHttpRequest object
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */

// Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onload
//         https://stackoverflow.com/questions/30008114/how-do-i-promisify-native-xhr
//         https://stackoverflow.com/questions/39519246/make-xmlhttprequest-post-using-json
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        // TODO: implement!
        // console.log("CampusExplorer.sendQuery not implemented yet.");
        // Create AJAX Request
        let httpRequest = new XMLHttpRequest(),
            method = "POST",
            url = "/query";

        httpRequest.open(method, url, true);
        httpRequest.onload = function() {
            if (this.status === 200) {
                return resolve(httpRequest.response);
            } else {
                return reject("Invalid query!");
            }
        };
        httpRequest.onerror = function () {
           return reject("Invalid query!");
        };
        const request = JSON.stringify(query);
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        httpRequest.send(request);
    });
};

/**
 * 
 * 
 * Created by Jayne O. for internal Filevine use
 * 
 * 
 * credit given to Valentin Despa for much of the code structure:
 * https://github.com/vdespa/newman-update-csv-file/blob/main/updateCSV.js
 * https://youtu.be/EGluwE-P4u4?si=3XPCJ5OJK_xQjZ3a
 * 
 * 
 * Newman Docs: https://github.com/postmanlabs/newman?tab=readme-ov-file#getting-started
 * Papaparse Docs: https://www.papaparse.com/
 * File System Docs: https://nodejs.org/api/fs.html
 * 
 * 
 */
const fs = require('fs'); // require and instantiate the Node.js File System Module as a variable
const Papa = require('papaparse'); // require and instantiate the Papaparse Module as a variable
const Newman = require('newman'); // require and instantiate the Newman Module as a variable

// user input variables
const iterationDataName = "deletedDocs.csv";
const collectionName = "userCollection.json";
const globalVariables = "userGlobals.json";

// runing the postman collection from user input via Newman.run()
Newman.run({
    collection: require(`./${collectionName}`),
    reporters: 'cli',
    iterationData: `./${iterationDataName}`,
    globals: require(`./${globalVariables}`),
    
}, (error) => {
	if (error) { 
        console.log(error + '\nERROR FROM \'Newman.run()\' call');
        return;
    }
    console.log('\nCOLLECTION RUN COMPLETE!');

    // collection has now been run, this allows us to get the data object returned from that Newman.run() call.
}).on('beforeDone', (error, data) => {
    if (error) {
        console.log(error + '\nERROR FROM \'Newman.run().beforeDone()\' call');
        return;
    }

    // Array of all executions' data extracted from the Newman.run() function's returned object.
    const executions = data.summary.run.executions;
    //const test = executions[0].response.stream;
    //console.log(JSON.parse(test));
    updateCsvFile(executions);
});

// this function allows us to take the executions Array and add the direct response data from each iteration to the user input CSV file.
function updateCsvFile(responseData) {
    fs.readFile(`./${iterationDataName}`, 'utf8', (error, data) => {
        if (error) {
            console.log(error + 'ERROR WITH READING ITTERATION DATA FROM \'updateCsvFile()\' call');
            return;
        }

        // parse user's input CSV into a JSON object
        const parsedCsv = Papa.parse(data, { header: true });
        
        //JSON.stringify(responseData[index].response.stream)

        // map the responses' buffer streams (response body) from our executions array into the JSON object
        parsedCsv.data.map((item, index) => {
            console.log(typeof responseData[index]);
            if (typeof responseData[index] === 'undefined') {
                item.ResponseBody = "No Valid Response Body Available"

            }
            else {
                item.ResponseBody = responseData[index].response.stream
            }
            
            console.log(item.ResponseBody)
        });

        // parse the now updated JSON object back into a CSV
        const parsedJson = Papa.unparse(parsedCsv.data);

        // update the user's input CSV file
        fs.writeFile(`./${iterationDataName}`, parsedJson, (error) => {
            if (error) {
                console.log(error + 'ERROR WITH UPDATING ITTERATION DATA FROM \'updateCsvFile()\' call');
                return;
            }
            console.log('\'updateCsvFile()\' call was sucessful! \n\nYour CSV is now updated with the API response data!');
        });

    });
}
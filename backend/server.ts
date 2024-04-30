import express from 'express';
import cors from 'cors';
import multer from 'multer';
import csvToJson from 'convert-csv-to-json';


const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const port = process.env.PORT ?? 3000;

let userData: Array<Record<string, string>> = [] ;

app.use(cors());

app.post('/api/files', upload.single('file') , async (req, res) => {
    //1. extract the file from the request
    const { file } = req;

    //2. validate the file
    if(!file) {
        return res.status(500).json({message: 'File is required'});
    }

    //3. Validate mimetype (csv)
    if(file.mimetype !== 'text/csv') {
        return res.status(500).json({message: 'File type not supported'});
    }
    let json: Array<Record<string, string>> = [];
    try {
         // 4. Transform El file, buffer to string
        const rawCSV = Buffer.from(file.buffer).toString('utf-8');
        console.log('File content', rawCSV);
        // 5. Parse the CSV file
        json = csvToJson.fieldDelimiter(',').csvStringToJson(rawCSV);
    } catch (error) {
        return res.status(500).json({message: 'Error parsing file'});
    }
    // 6. Save JSon to db or memory
    userData = json;
    //7. return 200 with message and JSON data
    return res.status(200).json({message: 'File uploaded successfully', data: userData});
})

app.get('/api/users', async (req, res) => {
    // 1. get query param q from request
    const { q } = req.query;
    // 2. validate query param
    if(!q) {
        return res.status(500).json({message: 'Query param q is required'});
    }

    if(Array.isArray(q)){
        return res.status(500).json({message: 'Query param q is invalid'});
    }
    // 3. filter data with query param
    const search = q.toString().toLowerCase();
    const filteredData = userData.filter( row =>{
        return Object
            .values(row)
            .some( value => value.toLowerCase().includes(search));
    });

    // 4. return 200 with message and JSON filtered data

    return res.status(200).json({data: filteredData});
})

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

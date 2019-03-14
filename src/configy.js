import {File} from "./file"

export const configy = {
    directory: __dirname,
    defaults: []
};

function middleware(req, res, next) {
    console.log('Hey');
}

// Initialization
export default function ({directory, descs}) { // TODO: Add functionality to force "required: false" to be exported too
    configy.directory = directory || configy.directory;
    
    descs.forEach(desc => {
        const file = new File(desc);
        //file.verify();
        configy.defaults.push(file);
        file.save();
    });
    
    return middleware;
}

import { File } from "./file"

export const vaultlet = {
    directory: __dirname,
    defaults: []
};

function middleware (req, res, next) {
    console.log('Hey');
}

// Initialization
export default function ({directory, defaults}) { // TODO: Add functionality to force "required: false" to be exported too
    vaultlet.directory = directory || vaultlet.directory;
    

    defaults.forEach(def => {
        const file = new File(def);
        //file.verify();
        vaultlet.defaults.push(file)
        file.save();
    });
    
    return middleware;
}



function iterateObject (obj, callback) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const o = obj[key];
        
            if (check.object(o) || check.array(o)) {
                // If attribute is another obj: repeat
                iterateObject(o, callback);
            } else {
                if (check.function(callback)) {
                    callback(o);
                } else {
                    throw new Error("Missing callback function. Check your parameters");
                }
            }
        }
    }
}
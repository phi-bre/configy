
import _path from "path";
import _fs from "fs";
import check from "check-types";
import { configy } from "./configy";

export const properties = [
    "required",
    "type",
    "default",
    "allowed",
    "static"
];

/**
 * Represents a configuration file
 */
export class File {
    
    constructor (path, config) {
        this.path = _path.join(configy.directory, path);
        try {
            this.tree = require(this.path);
        } catch (error) {
            throw new Error("Invalid path");
        }
        this.verifyDefaultStructure();
        if (config) {
            this.config = _path.join(configy.directory, config);
        } else {
            this.config = this.path.split('.')[0] + ".json";
        }
        this.load();
    }
    
    verifyDefaultStructure() {
        this.iterateTree(o => {
            /*
            if (o['required']) {
                if (check.assigned(o.value))
                    throw new Error("Field is required".to);
            }
    
            if (o['type'] && check.nonEmptyString(o.type)) {
                switch (o.type.toLowerCase()) {
                    case 'string':
                        if (check.not.string(o.value))
                            throw new Error("Value is not of type String");
                        break;
                    case 'number':
                        if (check.not.number(o.value))
                            throw new Error("Value is not of type Number");
                        break;
                    case 'boolean':
                        if (check.not.boolean(o.value))
                            throw new Error("Value is not of type Boolean");
                        break;
                    //case 'null': //case 'undefined':
                    default:
                        throw new Error("Type defined in default is not supported");
                }
            }
    
            if (o['default']) {
        
            }
    
            if (o['allowed']) {
                if (check.nonEmptyArray(o.allowed)) {
                    // If allowed is an array, loop through it and check if value is none of them.
                    if (o.every(a => check.not.equal(a, o.value)))
                        throw new Error("Value: " + o.value + " is not allowed");
                } else {
                    throw new Error("The property 'allowed' should be an Array. If you are looking for a default, required and static/final value use 'static' instead");
                }
            }
    
            if (o['static']) {
                if (check.not.equal(o.default, o.value)) {
                    throw new Error("Value does not match Default on property defined as static");
                }
            }
            */
        })
    }

    verify(force) {
        this.iterateTree(o => {
            
            if (o['required']) {
                if (check.assigned(o.value)) 
                    throw new Error("Field is required".to);
            }

            if (o['type'] && check.nonEmptyString(o.type)) {
                switch (o.type.toLowerCase()) {
                    case 'string': 
                        if (check.not.string(o.value)) 
                        throw new Error("Value is not of type String");
                        break;
                    case 'number': 
                        if (check.not.number(o.value)) 
                        throw new Error("Value is not of type Number");
                        break;
                    case 'boolean': 
                        if (check.not.boolean(o.value)) 
                        throw new Error("Value is not of type Boolean");
                        break;
                    //case 'null': //case 'undefined':
                    default: 
                        throw new Error("Type defined in default is not supported");
                }
            }

            if (o['default']) {
            
            }

            if (o['allowed']) {
                if (check.nonEmptyArray(o.allowed)) {
                    // If allowed is an array, loop through it and check if value is none of them.
                    if (o.every(a => check.not.equal(a, o.value))) 
                        throw new Error("Value: " + o.value + " is not allowed");
                } else {
                    throw new Error("The property 'allowed' should be an Array. If you are looking for a default, required and static/final value use 'static' instead");
                }
            }

            if (o['static']) {
                if (check.not.equal(o.default, o.value)) {
                    throw new Error("Value does not match Default on property defined as static");
                }
            }
        });
    }

    static iterateObject(obj, callback, history = '') {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const o = obj[key];
                if (check.nonEmptyObject(o)) {
                    o.history = history + '.' + key;
                    if (o.history.charAt(0) === '.') o.history = o.history.substring(1);
                    if (check.undefined(callback(o))) {
                        File.iterateObject(o, callback, o.history);
                    }
                }
            }
        }
    }

    iterateTree(callback) {
        File.iterateObject(this.tree, callback);
    }

    static getProperty(history, obj) {
        const array = history.split('.');
        for (let i = 0; i < array.length; i++) {
            if (obj) {
                obj = obj[array[i]];
            } else {
                throw new Error("Property " + array[i - 1] + " is not defined");
            }
        }
        return obj;
    }
    
    static setProperty(history, obj, value) {
        const array = history.split('.');
        let layer = obj;
        for (let i = 0; i < array.length; i++) {
            if (layer) {
                layer = layer[array[i]];
            } else {
                layer[array[i]] = {};
                layer = layer[array[i]];
            }
        }
        obj = value;
        return obj;
    }

    getNode(history) {
        File.getProperty(history, this.tree);
    }

    load() {
        _fs.exists(this.config, (exists) => {
            if (exists) {
                _fs.readFile(this.config, (err, data) => {
                    const config = JSON.parse(data);
                    this.iterateTree(o => {
                        let value = File.getProperty(o.history, config);
                        console.log(value)
                        if (value) {
                            o.value = value;
                        } else {
                            if (o.default && o.required) {
                                o.value = o.default
                            }
                        }
                    });
                })
            } else {
                console.error("Config file does not exist. Creating new one");
                this.restoreDefault();
                console.log(this.tree)
            }
        })
    }

    save() {
        _fs.writeFile(this.config, JSON.stringify(this.getConfig()),
            (err) => {
                if (err) {
                    throw new Error("Could not save Config to " + this.config);
                }
            }
        );
    }

    getConfig() {
        const config = {};
        this.iterateTree(o => {
            const array = o.history.split(".");
            for (let i = 0; i < ) {
            
            }
            config[o.history] = o.value;
        });
        return config;
    }

    restoreDefault() {
        this.iterateTree(o => {
            if (o.default) {
                o.value = o.default;
            } else {
                delete o.value;
            }
        })
    }

    get(id) {

    }

    set(id, value) {

    }
}
